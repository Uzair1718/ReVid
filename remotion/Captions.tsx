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
}

export const Captions: React.FC<CaptionsProps> = ({ captions, style = 'pop', color = '#ffffff' }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTime = frame / fps;

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

    // Style Logic
    let containerStyle: React.CSSProperties = {
        fontFamily: 'Montserrat, Roboto, sans-serif',
        textShadow: '0 0 10px rgba(0,0,0,0.5), 2px 2px 0px black'
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
        <div className="absolute top-[60%] left-0 w-full text-center px-8 z-50">
            <h1
                className={className}
                style={{
                    ...containerStyle,
                    transform
                }}
            >
                {activeWord.word}
            </h1>
        </div>
    );
};
