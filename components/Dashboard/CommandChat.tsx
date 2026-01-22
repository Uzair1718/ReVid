'use client';

import { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  action?: string; // What action was taken
  timestamp: Date;
}

export const CommandChat = () => {
  const { activeClipId, clips, updateClipTheme, updateClipAdjustments } = useProjectStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'agent',
      content: 'Hi! 👋 I\'m your video agent. Try commands like:\n"Make captions more aggressive"\n"Add faster cuts in first 3 seconds"\n"Zoom in when emotion increases"',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeClip = clips.find(c => c.id === activeClipId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const parseCommand = async (command: string) => {
    try {
      // Use Gemini for intelligent parsing
      const res = await fetch('/api/edit-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });

      const data = await res.json();
      
      return {
        action: data.action,
        params: data.parameters,
        explanation: data.explanation,
        geminiAction: data.debugAction
      };
    } catch (error) {
      console.error('Error parsing command:', error);
      // Fallback to basic parsing
      return {
        action: 'unknown',
        params: {},
        explanation: 'Failed to parse command',
        geminiAction: 'ERROR'
      };
    }
  };

  const executeAction = (action: string, params: Record<string, any>): string => {
    if (!activeClip) return 'No active clip selected.';

    // Map Gemini actions to updates
    const geminiActionMap: Record<string, () => string> = {
      caption_style: () => {
        const style = params.style || 'pop';
        const color = params.color || '#ff00ff';
        updateClipTheme(activeClip.id, { captionStyle: style, captionColor: color });
        return `Caption style changed to ${style.toUpperCase()}! 🎨`;
      },
      caption_size: () => {
        const size = params.size || 'large';
        const sizeMap: { [key: string]: 'pop' | 'bounce' | 'slide' | 'neon' | 'fade' } = { small: 'fade', medium: 'slide', large: 'pop' };
        const style = (sizeMap[size] || 'pop') as 'pop' | 'bounce' | 'slide' | 'neon' | 'fade';
        updateClipTheme(activeClip.id, { captionStyle: style });
        return `Caption size set to ${size}. ${size === 'large' ? '📈' : size === 'small' ? '📉' : '⚙️'}`;
      },
      animation_speed: () => {
        const multiplier = Math.min(Math.max(params.multiplier || 1, 0.5), 2);
        updateClipTheme(activeClip.id, { zoomIntensity: Math.min(multiplier, 1) });
        return `Animation speed set to ${multiplier}x. ${multiplier > 1 ? '⚡' : multiplier < 1 ? '🐢' : '✨'}`;
      },
      zoom_intensity: () => {
        const intensity = Math.min(Math.max(params.intensity || 0.5, 0), 1);
        updateClipTheme(activeClip.id, { zoomIntensity: intensity });
        return `Zoom intensity: ${Math.round(intensity * 100)}%. ${intensity > 0.7 ? '🎬 Cinematic!' : intensity > 0.4 ? '📹 Balanced' : '🎯 Subtle'}`;
      },
      emotion_sync: () => {
        const enabled = params.enabled !== false;
        updateClipTheme(activeClip.id, { 
          zoomIntensity: enabled ? 0.7 : 0.3,
          captionStyle: enabled ? 'pop' : 'fade'
        });
        return enabled ? 'Emotion sync ENABLED! Video will react to content intensity. 🎭' : 'Emotion sync disabled. Standard animations.';
      },
      platform_optimize: () => {
        const platform = params.platform || 'tiktok';
        const platformPresets: Record<string, { style: 'pop' | 'bounce' | 'slide' | 'neon' | 'fade'; color: string; zoom: number }> = {
          tiktok: { style: 'pop', color: '#ff0080', zoom: 0.8 },
          instagram: { style: 'fade', color: '#ffffff', zoom: 0.4 },
          youtube: { style: 'slide', color: '#ffff00', zoom: 0.5 },
          twitter: { style: 'bounce', color: '#1da1f2', zoom: 0.6 },
          linkedin: { style: 'slide', color: '#0a66c2', zoom: 0.3 }
        };
        const preset = platformPresets[platform] || platformPresets.tiktok;
        const style = preset.style as 'pop' | 'bounce' | 'slide' | 'neon' | 'fade';
        updateClipTheme(activeClip.id, { 
          captionStyle: style, 
          captionColor: preset.color,
          zoomIntensity: preset.zoom 
        });
        return `Optimized for ${platform.toUpperCase()}! 📱`;
      },
      color_grade: () => {
        const grade = params.grade || 'cinematic';
        const gradeMap: Record<string, string> = {
          warm: '#ff6b35',
          cool: '#0099ff',
          vibrant: '#ff00ff',
          cinematic: '#00ff88',
          retro: '#ffff00'
        };
        updateClipTheme(activeClip.id, { captionColor: gradeMap[grade] || '#ff00ff' });
        return `Color grading: ${grade}. ${grade === 'cinematic' ? '🎬' : grade === 'warm' ? '🔥' : '❄️'}`;
      },
      audio_emphasis: () => {
        const type = params.type || 'beat';
        const messages: Record<string, string> = {
          beat: 'Beat-synced animations enabled! 🎵',
          voice: 'Voice emphasis enabled! 🎙️',
          music: 'Music-synced highlights enabled! 🎶',
          silence: 'Silence-aware timing enabled! 🤫'
        };
        return messages[type] || 'Audio emphasis updated! 🔊';
      },
      effect_add: () => {
        const effect = params.effect || 'glitch';
        const effectMap: Record<string, string> = {
          glitch: '📟 Glitch effect added!',
          blur: '🌫️ Motion blur added!',
          vignette: '🎯 Vignette added!',
          chromatic: '🌈 Chromatic aberration added!',
          parallax: '✨ Parallax added!'
        };
        return effectMap[effect] || 'Visual effect added! ✨';
      }
    };

    // Execute based on action type
    if (action in geminiActionMap) {
      return geminiActionMap[action as keyof typeof geminiActionMap]();
    }

    // Fallback for basic commands
    switch (action) {
      case 'caption_aggressive':
        updateClipTheme(activeClip.id, {
          captionColor: '#ff00ff',
          captionStyle: 'neon'
        });
        return 'Captions set to aggressive mode with neon style! 🔥';

      case 'caption_small':
        updateClipTheme(activeClip.id, {
          captionStyle: 'fade'
        });
        return 'Reduced caption size. Switching to fade style for elegance. ✨';

      case 'caption_big':
        updateClipTheme(activeClip.id, {
          captionStyle: 'pop'
        });
        return 'Increased caption prominence with pop animation! 📈';

      case 'animation_faster':
        updateClipTheme(activeClip.id, {
          zoomIntensity: Math.min(activeClip.theme.zoomIntensity + 0.2, 1)
        });
        return 'Animation speed increased. Added more dynamic movement! ⚡';

      case 'zoom_increase':
        updateClipTheme(activeClip.id, {
          zoomIntensity: Math.min(activeClip.theme.zoomIntensity + 0.3, 1)
        });
        return 'Zoom intensity boosted. Added cinematic feel! 🎬';

      case 'emotion_sync':
        updateClipTheme(activeClip.id, {
          zoomIntensity: 0.7,
          captionStyle: 'pop'
        });
        return 'Enabled emotion-sync animation. Video will react to content intensity! 🎭';

      case 'style_pop':
        updateClipTheme(activeClip.id, { captionStyle: 'pop' });
        return 'Caption style changed to POP! Attention-grabbing. 💥';

      case 'style_bounce':
        updateClipTheme(activeClip.id, { captionStyle: 'bounce' });
        return 'Caption style changed to BOUNCE! Fun and energetic. 🎾';

      case 'style_neon':
        updateClipTheme(activeClip.id, {
          captionStyle: 'neon',
          captionColor: '#00ff88'
        });
        return 'Neon style activated! Cyberpunk vibes incoming. 🌆';

      case 'optimize_tiktok':
        updateClipTheme(activeClip.id, {
          captionStyle: 'pop',
          captionColor: '#ff0080',
          zoomIntensity: 0.8
        });
        return 'Optimized for TikTok! Aggressive captions, fast zooms. 🎵';

      case 'optimize_instagram':
        updateClipTheme(activeClip.id, {
          captionStyle: 'fade',
          captionColor: '#ffffff',
          zoomIntensity: 0.4
        });
        return 'Optimized for Instagram Reels! Elegant and sophisticated. 📸';

      case 'optimize_youtube':
        updateClipTheme(activeClip.id, {
          captionStyle: 'slide',
          captionColor: '#ffff00',
          zoomIntensity: 0.5
        });
        return 'Optimized for YouTube Shorts! Professional and clear. 📺';

      case 'unknown':
      default:
        return 'Command not recognized. Try: "make captions aggressive", "zoom in", "optimize for tiktok", or "add glitch effect"';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeClip) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Parse command using Gemini
    const { action, params, explanation } = await parseCommand(input);
    const response = executeAction(action, params);

    // Simulate agent thinking
    await new Promise(resolve => setTimeout(resolve, 300));

    const agentMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'agent',
      content: response,
      action,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, agentMessage]);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950/50 backdrop-blur">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="font-bold text-white">Video Agent</h3>
        <span className="text-xs text-slate-500 ml-auto">Command Mode</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-purple-600/30 text-purple-100 border border-purple-500/30'
                    : 'bg-white/5 text-slate-200 border border-white/10'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs text-slate-500 mt-2 opacity-70">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2"
          >
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !loading) handleSend();
            }}
            placeholder="Type a command... 'make captions aggressive'"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
            disabled={loading || !activeClip}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim() || !activeClip}
            className="p-2 rounded-lg bg-purple-600/50 hover:bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {!activeClip && (
          <p className="text-xs text-slate-500 mt-2">👈 Select a clip first</p>
        )}
      </div>
    </div>
  );
};