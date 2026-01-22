import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, useVideoConfig } from 'remotion';
import { Captions } from './Captions';
import { Word } from '@/store/useProjectStore';
import { z } from 'zod';

export const shortsSchema = z.object({
    videoSrc: z.string(),
    captions: z.array(z.object({
        word: z.string(),
        start: z.number(),
        end: z.number(),
        highlight: z.boolean().optional()
    })),
    title: z.string(),
    clipStart: z.number(),
    clipEnd: z.number().optional(),
    language: z.enum(['en', 'ur', 'hi', 'ps']).optional(),
    captionStyle: z.enum(['pop', 'bounce', 'slide', 'neon', 'fade']),
    captionColor: z.string(),
    bgMusicUrl: z.string().optional(),
    bgMusicVolume: z.number().optional(),
    voiceoverUrl: z.string().optional(),
    brightness: z.number().optional(),
    contrast: z.number().optional(),
    saturation: z.number().optional(),
});

type ShortsCompositionProps = z.infer<typeof shortsSchema>;

export const ShortsComposition: React.FC<ShortsCompositionProps> = ({
    videoSrc,
    captions,
    title,
    clipStart,
    clipEnd,
    language = 'en',
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
                    language={language}
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
