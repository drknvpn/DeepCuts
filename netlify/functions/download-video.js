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
    console.log('Processing URL:', url, 'Quality:', quality);

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
      console.log('Processing YouTube URL...');
      
      // Try y2mate API
      try {
        const y2mateResponse = await fetch('https://www.y2mate.com/mates/analyzeV2/ajax', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          body: `url=${encodeURIComponent(url)}&q_auto=0&ajax=1`
        });

        const y2mateData = await y2mateResponse.json();
        console.log('Y2mate response:', y2mateData);
        
        if (y2mateData.status === 'ok' && y2mateData.links && y2mateData.links.mp4) {
          const qualityKey = Object.keys(y2mateData.links.mp4).find(key => 
            key.includes(quality.replace('p', '')) || key.includes('720')
          ) || Object.keys(y2mateData.links.mp4)[0];
          
          if (y2mateData.links.mp4[qualityKey]) {
            result = {
              success: true,
              downloadUrl: y2mateData.links.mp4[qualityKey].url,
              title: (y2mateData.title || 'youtube_video').replace(/[^a-zA-Z0-9]/g, '_') + '.mp4',
              platform: 'YouTube'
            };
          }
        }
      } catch (error) {
        console.log('Y2mate error:', error.message);
      }

      // Fallback: Try SaveFrom.net API
      if (!result) {
        try {
          const savefromResponse = await fetch(`https://worker-savefrom-net.herokuapp.com/api/convert?url=${encodeURIComponent(url)}`);
          const savefromData = await savefromResponse.json();
          console.log('SaveFrom response:', savefromData);
          
          if (savefromData.success && savefromData.url && savefromData.url.length > 0) {
            const videoUrl = savefromData.url.find(item => 
              item.quality && item.quality.includes(quality.replace('p', ''))
            ) || savefromData.url[0];
            
            if (videoUrl && videoUrl.url) {
              result = {
                success: true,
                downloadUrl: videoUrl.url,
                title: (savefromData.meta?.title || 'youtube_video').replace(/[^a-zA-Z0-9]/g, '_') + '.mp4',
                platform: 'YouTube'
              };
            }
          }
        } catch (error) {
          console.log('SaveFrom error:', error.message);
        }
      }

      // Last fallback: Simple proxy approach
      if (!result) {
        try {
          const simpleResponse = await fetch('https://api.vevioz.com/api/button/mp4/' + encodeURIComponent(url));
          const simpleData = await simpleResponse.json();
          console.log('Simple API response:', simpleData);
          
          if (simpleData.success && simpleData.url) {
            result = {
              success: true,
              downloadUrl: simpleData.url,
              title: (simpleData.title || 'youtube_video').replace(/[^a-zA-Z0-9]/g, '_') + '.mp4',
              platform: 'YouTube'
            };
          }
        } catch (error) {
          console.log('Simple API error:', error.message);
        }
      }
    }

    // TikTok processing
    if (isTikTok) {
      console.log('Processing TikTok URL...');
      
      // Try TikWM API
      try {
        const tikResponse = await fetch('https://www.tikwm.com/api/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          body: `url=${encodeURIComponent(url)}&hd=1`
        });

        const tikData = await tikResponse.json();
        console.log('TikWM response:', tikData);
        
        if (tikData.code === 0 && tikData.data && tikData.data.play) {
          result = {
            success: true,
            downloadUrl: tikData.data.play,
            title: (tikData.data.title || 'tiktok_video').replace(/[^a-zA-Z0-9]/g, '_') + '.mp4',
            platform: 'TikTok'
          };
        }
      } catch (error) {
        console.log('TikWM error:', error.message);
      }

      // Fallback: Try SnapTik API
      if (!result) {
        try {
          const snaptikResponse = await fetch('https://snaptik.app/abc2.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: `url=${encodeURIComponent(url)}&lang=en`
          });

          const snaptikData = await snaptikResponse.json();
          console.log('SnapTik response:', snaptikData);
          
          if (snaptikData.status === 'ok' && snaptikData.data && snaptikData.data.length > 0) {
            const videoData = snaptikData.data[0];
            result = {
              success: true,
              downloadUrl: videoData.url,
              title: 'tiktok_video.mp4',
              platform: 'TikTok'
            };
          }
        } catch (error) {
          console.log('SnapTik error:', error.message);
        }
      }
    }

    if (result) {
      console.log('Success result:', result);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      };
    } else {
      console.log('No result found');
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
        error: 'Произошла ошибка при обработке запроса: ' + error.message 
      }),
    };
  }
};