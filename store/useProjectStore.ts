import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Platform = 'youtube' | 'instagram' | 'tiktok';

export interface Word {
    word: string;
    start: number;
    end: number;
    highlight?: boolean;
}

export interface VideoAdjustments {
    brightness: number; // 0.5 - 1.5, default 1
    contrast: number;   // 0.5 - 1.5, default 1
    saturation: number; // 0 - 2, default 1
}

export interface ExportSettings {
    format: 'mp4' | 'mov';
    resolution: '720p' | '1080p';
    isExporting: boolean;
    progress: number; // 0-100
}

export interface Clip {
    id: string; // Unique ID (e.g., index)
    start: number;
    end: number;
    text: string; // Full text
    words: Word[];
    score: number;
    reason: string;
    theme: {
        captionStyle: 'pop' | 'bounce' | 'slide' | 'neon' | 'fade';
        captionColor: string;
        bgMusicUrl?: string;
        bgMusicVolume: number; // 0-1
        zoomIntensity: number; // 0-1
        voiceoverUrl?: string;
    };
    adjustments?: VideoAdjustments;
}

export interface ProjectState {
    videoUrl: string;
    sourceVideoPath: string | null; // The downloaded file path (server side uses this, client might use URL)
    clips: Clip[];
    activeClipId: string | null;
    platform: Platform;
    isLoading: boolean;
    loadingStep: string;
    language: 'en' | 'ur' | 'ps';

    exportSettings: ExportSettings;

    // Actions
    setVideoUrl: (url: string) => void;
    setSourceVideoPath: (path: string) => void;
    setIsLoading: (loading: boolean, step?: string) => void;
    setClips: (clips: Clip[]) => void;
    setActiveClip: (id: string) => void;
    setPlatform: (platform: Platform) => void;
    setLanguage: (lang: 'en' | 'ur' | 'ps') => void;

    // Edit Actions
    updateClipTheme: (id: string, theme: Partial<Clip['theme']>) => void;
    updateClipAdjustments: (id: string, adjustments: Partial<VideoAdjustments>) => void;
    updateClipWord: (clipId: string, wordIndex: number, newWord: Partial<Word>) => void;

    // Export Actions
    setExportSettings: (settings: Partial<ExportSettings>) => void;
    resetProject: () => void;
}

export const useProjectStore = create<ProjectState>()(
    persist(
        (set) => ({
            videoUrl: '',
            sourceVideoPath: null,
            clips: [],
            activeClipId: null,
            platform: 'youtube', // Default
            isLoading: false,
            loadingStep: '',
            language: 'en', // Default language

            exportSettings: {
                format: 'mp4',
                resolution: '1080p',
                isExporting: false,
                progress: 0
            },

            setVideoUrl: (url) => set({ videoUrl: url }),
            setSourceVideoPath: (path) => set({ sourceVideoPath: path }),
            setIsLoading: (loading, step) => set({ isLoading: loading, loadingStep: step || '' }),
            setClips: (clips) => set({ clips }),
            setActiveClip: (id) => set({ activeClipId: id }),
            setPlatform: (platform) => set({ platform }),

            setLanguage: (lang) => set({ language: lang }),

            updateClipTheme: (id, theme) => set((state) => ({
                clips: state.clips.map(c => c.id === id ? { ...c, theme: { ...c.theme, ...theme } } : c)
            })),

            updateClipAdjustments: (id, adjustments) => set((state) => ({
                clips: state.clips.map(c => c.id === id ? {
                    ...c,
                    adjustments: {
                        ...(c.adjustments || { brightness: 1, contrast: 1, saturation: 1 }),
                        ...adjustments
                    }
                } : c)
            })),

            updateClipWord: (clipId, wordIndex, newWord) => set((state) => ({
                clips: state.clips.map(c => {
                    if (c.id !== clipId) return c;
                    const newWords = [...c.words];
                    if (newWords[wordIndex]) {
                        newWords[wordIndex] = { ...newWords[wordIndex], ...newWord };
                    }
                    return { ...c, words: newWords };
                })
            })),

            setExportSettings: (settings) => set((state) => ({
                exportSettings: { ...state.exportSettings, ...settings }
            })),

            resetProject: () => set({
                videoUrl: '',
                clips: [],
                activeClipId: null,
                sourceVideoPath: null,
                isLoading: false,
                exportSettings: { format: 'mp4', resolution: '1080p', isExporting: false, progress: 0 }
            })
        }),
        {
            name: 'revid-storage', // name of the item in the storage (must be unique)
            partialize: (state) => ({ language: state.language }), // persist only language
        }
    )
);
