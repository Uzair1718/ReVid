import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, useVideoConfig } from 'remotion';
import { Captions } from './Captions';
import { Word } from '@/store/useProjectStore';

interface ShortsCompositionProps {
    videoSrc: string;
    captions: Word[];
    title: string;
    clipStart: number; // in seconds
    captionStyle: 'pop' | 'bounce' | 'slide' | 'neon' | 'fade';
    captionColor: string;
    bgMusicUrl?: string;
    bgMusicVolume?: number;
    voiceoverUrl?: string;
    brightness?: number;
    contrast?: number;
    saturation?: number;
}

export const ShortsComposition: React.FC<ShortsCompositionProps> = ({
    videoSrc,
    captions,
    title,
    clipStart,
    captionStyle,
    captionColor,
    bgMusicUrl,
    bgMusicVolume = 0.2,
    voiceoverUrl,
    brightness = 1,
    contrast = 1,
    saturation = 1,
}) => {
    const { fps } = useVideoConfig();

    // Calculate start frame based on clipStart time
    const startFrame = Math.floor(clipStart * fps);

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            <OffthreadVideo
                src={videoSrc}
                startFrom={startFrame}
                style={{
                    height: '100%',
                    width: '100%',
                    objectFit: 'cover',
                    filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`
                }}
            />

            {/* Captions Overlay */}
            <AbsoluteFill>
                <Captions
                    captions={captions}
                    style={captionStyle}
                    color={captionColor}
                />
            </AbsoluteFill>

            {/* Background Music */}
            {bgMusicUrl && (
                <Audio src={bgMusicUrl} volume={bgMusicVolume} loop />
            )}

            {/* Voiceover */}
            {voiceoverUrl && (
                <Audio src={voiceoverUrl} volume={1.0} />
            )}
        </AbsoluteFill>
    );
};
