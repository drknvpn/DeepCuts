import React, { useState } from 'react';
import { Download, HelpCircle, Youtube, Music, Video, X, ExternalLink, Play, Zap, ArrowDown } from 'lucide-react';

function App() {
  const [url, setUrl] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadResult, setDownloadResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    if (!url.trim()) {
      alert('Пожалуйста, введите ссылку на видео');
      return;
    }

    setIsProcessing(true);
    setError('');
    setDownloadResult(null);
    
    try {
      const response = await fetch('/api/download-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, format: 'mp4' })
      });

      const data = await response.json();

      if (data.success) {
        setDownloadResult(data);
      } else {
        setError(data.error || 'Произошла ошибка при скачивании');
      }
    } catch (err) {
      setError('Ошибка соединения. Проверьте интернет и повторите попытку.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectDownload = (downloadUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const detectPlatform = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'YouTube';
    } else if (url.includes('tiktok.com')) {
      return 'TikTok';
    }
    return null;
  };

  const platform = detectPlatform(url);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Static noise background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
              radial-gradient(circle at 40% 20%, white 1px, transparent 1px),
              radial-gradient(circle at 90% 80%, white 1px, transparent 1px),
              radial-gradient(circle at 60% 70%, white 1px, transparent 1px),
              radial-gradient(circle at 10% 90%, white 1px, transparent 1px),
              radial-gradient(circle at 80% 30%, white 1px, transparent 1px),
              radial-gradient(circle at 30% 40%, white 1px, transparent 1px),
              radial-gradient(circle at 70% 10%, white 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px, 150px 150px, 200px 200px, 120px 120px, 180px 180px, 90px 90px, 160px 160px, 110px 110px',
            animation: 'staticNoise 0.1s infinite linear'
          }}
        ></div>
        <div 
          className="absolute inset-0 opacity-[0.008]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 25%, white 0.5px, transparent 0.5px),
              radial-gradient(circle at 85% 75%, white 0.5px, transparent 0.5px),
              radial-gradient(circle at 45% 85%, white 0.5px, transparent 0.5px),
              radial-gradient(circle at 75% 45%, white 0.5px, transparent 0.5px)
            `,
            backgroundSize: '80px 80px, 120px 120px, 140px 140px, 100px 100px',
            animation: 'staticNoise 0.15s infinite linear reverse'
          }}
        ></div>
      </div>

      {/* CSS Animation for static noise */}
      <style jsx>{`
        @keyframes staticNoise {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-1px, 1px); }
          20% { transform: translate(1px, -1px); }
          30% { transform: translate(-1px, -1px); }
          40% { transform: translate(1px, 1px); }
          50% { transform: translate(-1px, 0px); }
          60% { transform: translate(1px, -1px); }
          70% { transform: translate(-1px, 1px); }
          80% { transform: translate(1px, 0px); }
          90% { transform: translate(-1px, -1px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Main input card */}
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl mb-12 relative overflow-hidden">
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 rounded-3xl"></div>
            <div className="relative z-10">
            {/* Title inside card */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white via-gray-200 to-slate-300 bg-clip-text text-transparent">
                FUCK THE ADS
              </h1>
              <p className="text-lg text-gray-300 font-light">
                Никакой рекламы, только ты и ссылка.
              </p>
            </div>

            <div className="space-y-6">
              {/* URL input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {platform === 'YouTube' && <Youtube className="h-6 w-6 text-red-400" />}
                  {platform === 'TikTok' && <Music className="h-6 w-6 text-gray-300" />}
                  {!platform && <Video className="h-6 w-6 text-gray-400" />}
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Вставьте ссылку на видео из YouTube или TikTok..."
                  className="w-full pl-14 pr-4 py-4 bg-black/20 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 focus:bg-black/30 transition-all duration-300 text-lg"
                />
              </div>

              {/* Platform indicator */}
              {platform && (
                <div className="flex items-center justify-center">
                  <div className="inline-flex items-center space-x-2 bg-black/20 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2">
                    {platform === 'YouTube' && <Youtube className="h-4 w-4 text-red-400" />}
                    {platform === 'TikTok' && <Music className="h-4 w-4 text-gray-300" />}
                    <span className="text-gray-200 text-sm font-medium">
                      Обнаружена платформа: {platform}
                    </span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleDownload}
                  disabled={isProcessing}
                  className="flex-1 group relative overflow-hidden bg-gradient-to-r from-slate-700/60 to-gray-700/60 hover:from-slate-600/80 hover:to-gray-600/80 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-4 text-white font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div className="flex items-center justify-center space-x-3">
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      <Download className="h-6 w-6" />
                    )}
                    <span>
                      {isProcessing ? 'Обрабатываем...' : 'Скачать'}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </button>

                <button
                  onClick={() => setShowInstructions(true)}
                  className="sm:w-auto group relative overflow-hidden bg-black/20 hover:bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-4 text-white font-semibold text-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <HelpCircle className="h-6 w-6" />
                    <span>Инструкция</span>
                  </div>
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-900/30 backdrop-blur-sm border border-red-500/30 rounded-2xl p-4">
                  <p className="text-red-300 text-center">{error}</p>
                </div>
              )}

              {/* Download result */}
              {downloadResult && (
                <div className="bg-green-900/30 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6">
                  <div className="text-center">
                    <h3 className="text-white font-semibold text-lg mb-3">
                      Готово к скачиванию!
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {downloadResult.title}
                    </p>
                    <button
                      onClick={() => handleDirectDownload(downloadResult.downloadUrl, downloadResult.title)}
                      className="inline-flex items-center space-x-2 bg-green-700/60 hover:bg-green-600/80 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 text-white font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                    >
                      <ExternalLink className="h-5 w-5" />
                      <span>Скачать файл</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 rounded-2xl"></div>
              <div className="relative z-10">
              <Play className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">YouTube</h3>
              <p className="text-gray-400 text-sm">Скачивайте видео и музыку в высоком качестве</p>
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 rounded-2xl"></div>
              <div className="relative z-10">
              <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">TikTok</h3>
              <p className="text-gray-400 text-sm">Загружайте ролики без водяных знаков</p>
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 rounded-2xl"></div>
              <div className="relative z-10">
              <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Быстро</h3>
              <p className="text-gray-400 text-sm">Мгновенное скачивание в один клик</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/30 backdrop-blur-xl border border-white/15 rounded-3xl max-w-4xl w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 rounded-3xl"></div>
            <div className="relative z-10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Инструкция по использованию</h2>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="p-2 rounded-full bg-black/20 hover:bg-black/30 backdrop-blur-sm border border-white/10 transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-gray-200 mb-4">
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <h3 className="text-base font-semibold mb-2 flex items-center">
                    <Youtube className="h-5 w-5 text-red-400 mr-2" />
                    Скачивание с YouTube
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Скопируйте ссылку на видео YouTube</li>
                    <li>Вставьте её в поле ввода выше</li>
                    <li>Нажмите кнопку "Скачать"</li>
                    <li>Дождитесь завершения скачивания</li>
                  </ol>
                </div>

                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <h3 className="text-base font-semibold mb-2 flex items-center">
                    <Music className="h-5 w-5 text-gray-300 mr-2" />
                    Скачивание с TikTok
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Откройте TikTok и найдите нужное видео</li>
                    <li>Нажмите "Поделиться" → "Копировать ссылку"</li>
                    <li>Вставьте ссылку в поле ввода</li>
                    <li>Нажмите "Скачать"</li>
                  </ol>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-gray-200">
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <h3 className="text-base font-semibold mb-2">Поддерживаемые форматы</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-medium mb-1">Видео:</p>
                      <ul className="space-y-0.5 text-gray-400">
                        <li>• MP4 (HD, Full HD, 4K)</li>
                        <li>• WEBM</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Аудио:</p>
                      <ul className="space-y-0.5 text-gray-400">
                        <li>• MP3 (128-320 kbps)</li>
                        <li>• M4A</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4">
                  <h3 className="text-base font-semibold mb-2 text-yellow-300">Примечание</h3>
                  <p className="text-xs text-yellow-300">
                    <strong>Примечание:</strong> Убедитесь, что у вас есть права на скачивание контента. 
                    Уважайте авторские права создателей.
                  </p>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;