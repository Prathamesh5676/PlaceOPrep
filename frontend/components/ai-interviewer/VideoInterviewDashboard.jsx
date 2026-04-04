import { useState, useEffect } from 'react';
import { Bot, Clock, Radio, XCircle } from 'lucide-react';

function VideoInterviewDashboard({ conversationUrl, sessionId, onEndInterview, duration = 30 }) {
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#6C5CE7] to-[#8B7CF6] rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-[#1F2937] font-bold text-lg">Video Interview</span>
        </div>

        <div className="inline-flex items-center gap-2 bg-[#22C55E] bg-opacity-10 text-[#22C55E] rounded-full px-4 py-2 text-sm font-semibold">
          <Radio className="w-4 h-4" />
          LIVE SESSION
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span className={`font-mono text-base font-semibold ${timeRemaining <= 60 ? 'text-red-500 animate-pulse' : ''}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          <button
            onClick={onEndInterview}
            className="flex items-center gap-2 px-4 py-2 border border-[#EF4444] text-[#EF4444] rounded-xl hover:bg-red-50 text-sm font-medium transition-colors"
          >
            <XCircle className="w-4 h-4" />
            End Interview
          </button>
        </div>
      </div>

      {/* Video iframe */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden" style={{ minHeight: '75vh' }}>
        <iframe
          src={conversationUrl}
          allow="camera; microphone; fullscreen; display-capture"
          className="w-full h-full border-0"
          style={{ minHeight: '75vh' }}
          title="Video Interview"
        />
      </div>
    </div>
  );
}

export default VideoInterviewDashboard;
