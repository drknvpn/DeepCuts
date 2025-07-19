import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DownloadRequest {
  url: string;
  format?: 'mp4' | 'mp3';
  quality?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, format = 'mp4', quality = 'best' }: DownloadRequest = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Определяем платформу
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')
    const isTikTok = url.includes('tiktok.com')

    if (!isYouTube && !isTikTok) {
      return new Response(
        JSON.stringify({ error: 'Поддерживаются только YouTube и TikTok ссылки' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Для YouTube используем yt-dlp через внешний API
    if (isYouTube) {
      const ytApiUrl = 'https://api.cobalt.tools/api/json'
      
      const response = await fetch(ytApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          vCodec: format === 'mp3' ? 'mp3' : 'h264',
          vQuality: quality === 'best' ? '1080' : quality,
          aFormat: 'mp3',
          isAudioOnly: format === 'mp3'
        })
      })

      const data = await response.json()
      
      if (data.status === 'success' || data.status === 'redirect') {
        return new Response(
          JSON.stringify({
            success: true,
            downloadUrl: data.url,
            title: data.filename || 'video',
            platform: 'YouTube'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Для TikTok используем другой подход
    if (isTikTok) {
      const tikApiUrl = 'https://api.tiklydown.eu.org/api/download'
      
      const response = await fetch(`${tikApiUrl}?url=${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      const data = await response.json()
      
      if (data.status === 200 && data.result) {
        return new Response(
          JSON.stringify({
            success: true,
            downloadUrl: data.result.video,
            title: data.result.title || 'tiktok_video',
            platform: 'TikTok',
            thumbnail: data.result.cover
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Fallback - если API не сработали, пробуем универсальный подход
    const fallbackResponse = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        vQuality: '720',
        aFormat: 'mp3',
        isAudioOnly: format === 'mp3'
      })
    })

    const fallbackData = await fallbackResponse.json()
    
    if (fallbackData.status === 'success' || fallbackData.status === 'redirect') {
      return new Response(
        JSON.stringify({
          success: true,
          downloadUrl: fallbackData.url,
          title: fallbackData.filename || 'video',
          platform: isYouTube ? 'YouTube' : 'TikTok'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        error: 'Не удалось обработать ссылку. Попробуйте другую ссылку или повторите позже.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Download error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Произошла ошибка при обработке запроса' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})