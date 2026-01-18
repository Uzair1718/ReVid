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
    setSourceVideoPath
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

    setIsLoading(true, "Analyzing Video...");

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl }),
      });
      const result = await res.json();

      if (result.success) {
        setIsLoading(true, 'Formatting Clips...');
        setSourceVideoPath(result.videoUrl); // Store local path for rendering

        // Map result to Clip objects
        const newClips = result.moments.map((m: any, i: number) => ({
          id: i.toString(),
          start: m.start,
          end: m.end,
          score: m.score,
          reason: m.reason,
          text: "",
          words: result.transcription.words
            .filter((w: any) => w.start >= m.start && w.end <= m.end)
            .map((w: any) => ({
              ...w,
              start: w.start - m.start,
              end: w.end - m.start
            })),
          theme: {
            captionStyle: 'pop',
            captionColor: '#ffffff',
            bgMusicVolume: 0.2,
            zoomIntensity: 0.5
          }
        }));

        setClips(newClips);
        if (newClips.length > 0) setActiveClip('0');

      } else {
        alert(result.error);
      }
    } catch (e) {
      alert('Error processing video');
      console.error(e);
    } finally {
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
