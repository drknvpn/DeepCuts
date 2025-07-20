const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { url, quality = '720p' } = JSON.parse(event.body);

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL is required' }),
      };
    }

    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isTikTok = url.includes('tiktok.com');

    if (!isYouTube && !isTikTok) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Поддерживаются только YouTube и TikTok ссылки' }),
      };
    }

    let result = null;

    // YouTube processing
    if (isYouTube) {
      try {
        // Try cobalt.tools for YouTube
        const cobaltResponse = await fetch('https://api.cobalt.tools/api/json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            url: url,
            vQuality: quality.replace('p', ''),
            vCodec: 'h264',
            aFormat: 'mp3',
            isAudioOnly: false
          })
        });

        const cobaltData = await cobaltResponse.json();
        
        if (cobaltData.status === 'success' || cobaltData.status === 'redirect') {
          result = {
            success: true,
            downloadUrl: cobaltData.url,
            title: cobaltData.filename || 'youtube_video.mp4',
            platform: 'YouTube'
          };
        }
      } catch (error) {
        console.log('Cobalt YouTube error:', error);
      }

      // Fallback for YouTube
      if (!result) {
        try {
          const fallbackResponse = await fetch('https://api.vevioz.com/api/button/mp4/' + encodeURIComponent(url));
          const fallbackData = await fallbackResponse.json();
          
          if (fallbackData.success && fallbackData.url) {
            result = {
              success: true,
              downloadUrl: fallbackData.url,
              title: fallbackData.title || 'youtube_video.mp4',
              platform: 'YouTube'
            };
          }
        } catch (error) {
          console.log('Fallback YouTube error:', error);
        }
      }
    }

    // TikTok processing
    if (isTikTok) {
      try {
        // Try tikwm.com for TikTok
        const tikResponse = await fetch('https://www.tikwm.com/api/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `url=${encodeURIComponent(url)}&hd=1`
        });

        const tikData = await tikResponse.json();
        
        if (tikData.code === 0 && tikData.data && tikData.data.play) {
          result = {
            success: true,
            downloadUrl: tikData.data.play,
            title: (tikData.data.title || 'tiktok_video').replace(/[^a-zA-Z0-9]/g, '_') + '.mp4',
            platform: 'TikTok'
          };
        }
      } catch (error) {
        console.log('TikTok error:', error);
      }

      // Fallback for TikTok
      if (!result) {
        try {
          const fallbackResponse = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: url,
              vQuality: '720',
              isAudioOnly: false
            })
          });

          const fallbackData = await fallbackResponse.json();
          
          if (fallbackData.status === 'success' || fallbackData.status === 'redirect') {
            result = {
              success: true,
              downloadUrl: fallbackData.url,
              title: fallbackData.filename || 'tiktok_video.mp4',
              platform: 'TikTok'
            };
          }
        } catch (error) {
          console.log('Fallback TikTok error:', error);
        }
      }
    }

    if (result) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Не удалось обработать ссылку. Попробуйте другую ссылку или повторите позже.' 
        }),
      };
    }

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Произошла ошибка при обработке запроса' 
      }),
    };
  }
};