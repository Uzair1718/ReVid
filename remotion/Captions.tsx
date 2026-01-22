import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface Word {
    word: string;
    start: number;
    end: number;
}

interface CaptionsProps {
    captions: Word[];
    style?: 'pop' | 'bounce' | 'slide' | 'neon' | 'fade';
    color?: string;
    language?: 'en' | 'ur' | 'hi' | 'ps';
}

// Translation service - converts caption text to different languages
async function translateCaption(text: string, language: string): Promise<string> {
    if (language === 'en') return text; // English stays same
    
    try {
        // Use Google Translate API (free tier via unpaid access)
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${getLanguageCode(language)}`
        );
        const data = await response.json();
        if (data.responseStatus === 200 && data.responseData?.translatedText) {
            return data.responseData.translatedText;
        }
    } catch (e) {
        console.warn(`[CAPTIONS] Translation failed for ${language}:`, e);
    }
    return text;
}

function getLanguageCode(language: string): string {
    const codes: Record<string, string> = {
        'ur': 'ur', // Urdu
        'hi': 'hi', // Hindi
        'ps': 'ps', // Pashto
        'en': 'en'  // English
    };
    return codes[language] || 'en';
}

function getLanguageFont(language: string): string {
    const fonts: Record<string, string> = {
        'en': 'Montserrat, Roboto, sans-serif',
        'hi': 'Noto Sans Devanagari, Roboto, sans-serif', // Hindi requires Devanagari
        'ur': 'Noto Nastaliq Urdu, Roboto, sans-serif',    // Urdu script
        'ps': 'Noto Sans Arabic, Roboto, sans-serif'       // Pashto/Persian script
    };
    return fonts[language] || fonts['en'];
}

function isRTL(language: string): boolean {
    return language === 'ur' || language === 'ps'; // Urdu and Pashto are RTL
}

export const Captions: React.FC<CaptionsProps> = ({ captions, style = 'pop', color = '#ffffff', language = 'en' }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTime = frame / fps;

    // Debug logging
    if (frame === 0) {
        console.log('[CAPTIONS] Captions received:', captions);
        console.log('[CAPTIONS] Caption count:', captions?.length || 0);
        console.log('[CAPTIONS] Language:', language);
        console.log('[CAPTIONS] Style:', style);
        if (captions && captions.length > 0) {
            console.log('[CAPTIONS] First caption:', captions[0]);
            console.log('[CAPTIONS] Last caption:', captions[captions.length - 1]);
        }
    }

    if (!captions || captions.length === 0) {
        if (frame === 0) {
            console.warn('[CAPTIONS] ⚠️ No captions provided - captions array is empty or undefined');
        }
        return null;
    }

    const activeWordIndex = captions.findIndex(w => currentTime >= w.start && currentTime <= w.end);
    const activeWord = activeWordIndex !== -1 ? captions[activeWordIndex] : null;

    if (!activeWord) return null;

    // Animation Primitives
    const timeSinceStart = currentTime - activeWord.start;
    const frameSinceStart = timeSinceStart * fps;

    const pop = spring({
        fps,
        frame: frameSinceStart,
        config: { damping: 12 },
        from: 0.5,
        to: 1.1 // Overshoot slightly
    });

    // Style Logic - Language-aware
    let containerStyle: React.CSSProperties = {
        fontFamily: getLanguageFont(language),
        textShadow: '0 0 10px rgba(0,0,0,0.5), 2px 2px 0px black',
        direction: isRTL(language) ? 'rtl' : 'ltr',
    };

    let transform = '';
    let className = "text-7xl font-black text-white uppercase drop-shadow-md tracking-wide";

    switch (style) {
        case 'pop':
            transform = `scale(${pop})`;
            containerStyle.color = color;
            break;
        case 'bounce':
            const jump = Math.sin(frameSinceStart * 0.5) * 20;
            transform = `translateY(-${Math.abs(jump)}px)`;
            containerStyle.color = color;
            break;
        case 'slide':
            const slideIn = interpolate(frameSinceStart, [0, 5], [-50, 0], { extrapolateRight: 'clamp' });
            transform = `translateX(${slideIn}px)`;
            containerStyle.color = color;
            containerStyle.fontStyle = 'italic';
            break;
        case 'neon':
            containerStyle.textShadow = `0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}`;
            transform = `scale(${1 + Math.sin(frameSinceStart * 0.1) * 0.05})`; // Pulse
            containerStyle.color = '#ffffff'; // Neon keeps white center usually, glow is colored
            containerStyle.border = `2px solid ${color}`;
            break;
        case 'fade':
            const opacity = interpolate(frameSinceStart, [0, 5], [0, 1], { extrapolateRight: 'clamp' });
            containerStyle.opacity = opacity;
            containerStyle.color = color;
            break;
    }

    return (
        <div 
            className={`absolute top-[60%] left-0 w-full text-center px-8 z-50`}
            style={{
                textAlign: isRTL(language) ? 'right' : 'center',
                paddingRight: isRTL(language) ? 16 : 0,
                paddingLeft: isRTL(language) ? 0 : 16,
            }}
        >
            <h1
                className={className}
                style={{
                    ...containerStyle,
                    transform,
                    // For RTL languages, align from right
                    marginRight: isRTL(language) ? 'auto' : undefined,
                    marginLeft: isRTL(language) ? 'auto' : undefined,
                }}
            >
                {activeWord.word}
            </h1>
        </div>
    );
};
