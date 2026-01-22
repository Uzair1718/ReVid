'use client';

import { useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { Dashboard } from '@/components/Dashboard/Dashboard';
import { LandingHeader } from '@/components/Landing/LandingHeader';
import { LandingHero } from '@/components/Landing/LandingHero';
import { LandingFeatures } from '@/components/Landing/LandingFeatures';
import { LandingShowcase } from '@/components/Landing/LandingShowcase';
import { LandingTestimonials } from '@/components/Landing/LandingTestimonials';
import { LandingFooter } from '@/components/Landing/LandingFooter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const {
    videoUrl,
    setVideoUrl,
    clips,
    setClips,
    setActiveClip,
    isLoading,
    setIsLoading,
    setSourceVideoPath,
    transcriptionLanguage,
    setTranscriptionLanguage,
    loadingStep
  } = useProjectStore();

  const [errorMsg, setErrorMsg] = useState('');

  // --- Processing Logic ---
  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return url.includes('youtube.com') || url.includes('youtu.be');
    } catch {
      return false;
    }
  };

  const handleProcess = async () => {
    setErrorMsg('');
    if (!videoUrl) return;

    if (!validateUrl(videoUrl)) {
      setErrorMsg("Please enter a valid YouTube URL");
      return;
    }

    setIsLoading(true, "🚀 Downloading Video...");

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 600000); // 10 minute timeout
      
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl, transcriptionLanguage, useAgent: true }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        setErrorMsg(error.error || `Server error: ${res.status}`);
        setIsLoading(false);
        return;
      }

      const result = await res.json();

      if (result.success) {
        setIsLoading(true, '🤖 ReVid-Agent Analyzing & Scoring Clips...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause for UX
        
        console.log('[PAGE] Transcription result:', {
          text: result.transcription.text?.substring(0, 100),
          wordCount: result.transcription.words?.length || 0,
          momentCount: result.moments?.length || 0,
          isFallback: result.transcription.isFallback
        });
        console.log('[PAGE] Full words array:', result.transcription.words);
        
        setIsLoading(true, '✨ Formatting Clips with Remotion...');
        setSourceVideoPath(result.videoUrl); // Store local path for rendering

        // Map result to Clip objects
        const newClips = result.moments.map((m: any, i: number) => {
          const clipWords = result.transcription.words
            .filter((w: any) => w.start >= m.start && w.end <= m.end)
            .map((w: any) => ({
              ...w,
              start: w.start - m.start,
              end: w.end - m.start
            }));
          
          console.log(`[CLIP ${i}] Moment: ${m.start}s-${m.end}s, Words: ${clipWords.length}`, clipWords.slice(0, 3));
          
          return {
            id: i.toString(),
            start: m.start,
            end: m.end,
            score: m.score,
            reason: m.reason,
            text: "",
            words: clipWords,
            theme: {
              captionStyle: 'pop',
              captionColor: '#ffffff',
              bgMusicVolume: 0.2,
              zoomIntensity: 0.5
            }
          };
        });

        setClips(newClips);
        if (newClips.length > 0) setActiveClip('0');

        // Show agent reflection if available
        if (result.reflection) {
          console.log('🎯 Agent Reflection:', result.reflection);
        }

        // Complete loading
        setIsLoading(false);

      } else {
        setErrorMsg(result.error || 'Failed to process video');
        setIsLoading(false);
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      setErrorMsg(`Error processing video: ${errorMsg}`);
      console.error('Fetch error:', e);
      setIsLoading(false);
    }
  };

  // --- Render ---

  // If we have clips, show the Dashboard
  if (clips.length > 0) {
    return <Dashboard />;
  }

  // Otherwise, show the Landing Page
  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
      {/* Agent Loading Modal */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-3xl p-8 max-w-md w-full mx-4 text-center backdrop-blur-xl"
          >
            <div className="mb-6 flex justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-5xl"
              >
                🤖
              </motion.div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">ReVid-Agent Processing</h2>
            
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-lg text-purple-300 font-semibold mb-6 h-8 min-h-8"
            >
              {loadingStep}
            </motion.div>

            {/* Dynamic Steps */}
            <div className="space-y-2.5 mb-6">
              <div className={`flex items-center gap-3 text-sm transition-colors ${loadingStep?.includes('Download') ? 'text-purple-300 font-semibold' : 'text-slate-400'}`}>
                <motion.div 
                  animate={loadingStep?.includes('Download') ? { scale: [1, 1.2, 1] } : {}} 
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-5 text-center"
                >
                  {loadingStep?.includes('Download') ? '⚙️' : loadingStep?.includes('Transcrib') || loadingStep?.includes('Analyzing') || loadingStep?.includes('Formatting') ? '✅' : '⏳'}
                </motion.div>
                <span>Downloading video</span>
              </div>
              
              <div className={`flex items-center gap-3 text-sm transition-colors ${loadingStep?.includes('Transcrib') ? 'text-purple-300 font-semibold' : 'text-slate-400'}`}>
                <motion.div 
                  animate={loadingStep?.includes('Transcrib') ? { scale: [1, 1.2, 1] } : {}} 
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-5 text-center"
                >
                  {loadingStep?.includes('Transcrib') ? '🎙️' : loadingStep?.includes('Download') ? '⏳' : loadingStep?.includes('Analyzing') || loadingStep?.includes('Formatting') ? '✅' : '⏳'}
                </motion.div>
                <span>Transcribing audio</span>
              </div>
              
              <div className={`flex items-center gap-3 text-sm transition-colors ${loadingStep?.includes('Analyzing') ? 'text-purple-300 font-semibold' : 'text-slate-400'}`}>
                <motion.div 
                  animate={loadingStep?.includes('Analyzing') ? { scale: [1, 1.2, 1] } : {}} 
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-5 text-center"
                >
                  {loadingStep?.includes('Analyzing') ? '🎬' : loadingStep?.includes('Download') || loadingStep?.includes('Transcrib') ? '⏳' : loadingStep?.includes('Formatting') ? '✅' : '⏳'}
                </motion.div>
                <span>Analyzing & scoring clips</span>
              </div>
              
              <div className={`flex items-center gap-3 text-sm transition-colors ${loadingStep?.includes('Formatting') ? 'text-purple-300 font-semibold' : 'text-slate-400'}`}>
                <motion.div 
                  animate={loadingStep?.includes('Formatting') ? { scale: [1, 1.2, 1] } : {}} 
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-5 text-center"
                >
                  {loadingStep?.includes('Formatting') ? '✨' : loadingStep?.includes('Download') || loadingStep?.includes('Transcrib') || loadingStep?.includes('Analyzing') ? '⏳' : '⏳'}
                </motion.div>
                <span>Formatting for Remotion</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-slate-400">This may take 1-3 minutes depending on video length</p>
            </div>
          </motion.div>
        </div>
      )}
      
      <LandingHeader />

      <LandingHero onStart={() => document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' })} />

      {/* Input Section (Integrated into flow) */}
      <section id="input-section" className="relative z-30 -mt-20 pb-24 px-6">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl w-full mx-auto"
        >
          <div className="p-2 bg-white/5 rounded-[2.5rem] shadow-2xl shadow-purple-900/20 border border-white/10 backdrop-blur-3xl relative group hover:border-purple-500/30 transition-all duration-500">
            {/* Transcription Language Selector */}
            <div className="px-6 pt-4 pb-2 flex items-center gap-2 border-b border-white/5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transcription Language:</span>
              <div className="flex gap-2">
                {[
                  { code: 'en', label: '🇬🇧 English', name: 'English' },
                  { code: 'hi', label: '🇮🇳 Hindi', name: 'Hindi (Roman)' },
                  { code: 'ur', label: '🇵🇰 Urdu', name: 'Urdu (Roman)' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setTranscriptionLanguage(lang.code as 'en' | 'hi' | 'ur')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all border ${
                      transcriptionLanguage === lang.code
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                    }`}
                    title={lang.name}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 relative p-2">
              <div className="flex-1 relative flex gap-2">
                <Input
                  placeholder="Paste YouTube Link here..."
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="h-16 bg-black/40 border-transparent text-lg px-8 focus:ring-0 focus:border-transparent placeholder:text-slate-500 text-white font-medium rounded-[2rem] w-full transition-all focus:bg-black/60"
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="video/mp4,video/mov,video/webm"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setVideoUrl(url); // Use blob URL as video URL
                        // We might need a different flow for local files to skip "download" step
                        // For now, let's treat it as a source
                        setSourceVideoPath(url);
                        // Mock clips generation for local file since we can't easily transcribe client-side without heavy models
                        // Ideally we'd send this file to server, but for "Client-side" reqs we might need a different approach.
                        // Let's just set it ready for manual clipping.
                        setIsLoading(true, "Preparing Local Video...");
                        setTimeout(() => {
                          setClips([{
                            id: '0',
                            start: 0,
                            end: 10, // Default 10s
                            text: "Manual Clip",
                            words: [],
                            score: 100,
                            reason: "Manual Import",
                            theme: { captionStyle: 'pop', captionColor: '#ffffff', bgMusicVolume: 0.2, zoomIntensity: 0.5 },
                          }]);
                          setActiveClip('0');
                          setIsLoading(false);
                        }, 1500);
                      }
                    }}
                  />
                  <label
                    htmlFor="file-upload"
                    className="h-16 px-6 flex items-center justify-center rounded-[2rem] bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-all border border-white/5"
                    title="Upload Video"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider">Upload</span>
                  </label>
                </div>
              </div>
              <Button
                size="lg"
                onClick={handleProcess}
                disabled={isLoading || !videoUrl}
                className="h-16 px-10 rounded-[2rem] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/20 border-none text-lg font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale whitespace-nowrap"
              >
                {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <Wand2 className="w-6 h-6 mr-2" />}
                {isLoading ? 'Processing...' : 'Generate'}
              </Button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-12 left-0 right-0 text-center"
              >
                <span className="inline-block bg-red-500/10 text-red-400 text-xs font-bold px-4 py-2 rounded-full border border-red-500/20">
                  {errorMsg}
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      <LandingFeatures />
      <LandingShowcase />
      <LandingTestimonials />

      {/* CTA Banner */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-indigo-900/40" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Ready to go viral?</h2>
          <Button
            size="lg"
            onClick={() => document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="h-20 px-12 rounded-full bg-white text-black hover:bg-slate-200 text-xl font-bold shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all hover:scale-105"
          >
            Start Creating for Free
          </Button>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
