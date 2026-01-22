/**
 * ReVid-Agent: Autonomous Video Intelligence Agent
 * Transforms long-form videos into high-performing short-form clips
 */

import { Clip, Word } from '@/store/useProjectStore';
import { analyzeTranscript } from './analysis';
import { transcribeAudio } from './transcription';
import path from 'path';

export interface AgentState {
    videoPath: string;
    duration: number;
    transcription: string;
    words: Word[];
    generatedClips: Clip[];
    scoredClips: ScoredClip[];
    memoryBank: MemoryBank;
    iterationCount: number;
    qualityThreshold: number;
}

export interface ScoredClip extends Clip {
    hookStrength: number;      // 1-10
    emotionalImpact: number;   // 1-10
    clarity: number;           // 1-10
    platformSuitability: {
        reels: number;
        shorts: number;
        tiktok: number;
    };
    overallScore: number;      // Average of above
    shouldDiscard: boolean;
    regenerationReason?: string;
}

export interface MemoryBank {
    workingCaptions: string[];
    workingStyles: string[];
    workingHooks: string[];
    platformWeights: Record<string, number>;
    lastImprovement: string;
}

export interface AgentReflection {
    whatWorked: string[];
    whatFailed: string[];
    improvements: string[];
    nextStrategy: string;
}

export class ReVidAgent {
    private state: AgentState;
    private reflection: AgentReflection;

    constructor(videoPath: string) {
        this.state = {
            videoPath,
            duration: 0,
            transcription: '',
            words: [],
            generatedClips: [],
            scoredClips: [],
            memoryBank: {
                workingCaptions: [],
                workingStyles: ['pop', 'bounce', 'slide'],
                workingHooks: [],
                platformWeights: { reels: 1, shorts: 1, tiktok: 1 },
                lastImprovement: 'Initial run'
            },
            iterationCount: 0,
            qualityThreshold: 7
        };

        this.reflection = {
            whatWorked: [],
            whatFailed: [],
            improvements: [],
            nextStrategy: 'Initial analysis'
        };
    }

    /**
     * MAIN ORCHESTRATION: Think → Plan → Act → Observe → Reflect → Improve
     */
    async generateClips(targetCount: number = 5): Promise<ScoredClip[]> {
        console.log(`[AGENT] Starting autonomous clip generation for ${targetCount} clips`);

        // THINK: Analyze the task
        await this.think();

        // PLAN: Create execution strategy
        const plan = this.plan(targetCount);
        console.log(`[AGENT] Execution plan: ${JSON.stringify(plan)}`);

        // ACT: Execute the plan
        await this.act(plan);

        // OBSERVE: Evaluate results
        await this.observe();

        // REFLECT: Self-critique
        this.reflect();

        // IMPROVE: Regenerate weak clips
        await this.improve(targetCount);

        return this.state.scoredClips;
    }

    /**
     * THINK: Internal reasoning about the task
     */
    private async think(): Promise<void> {
        console.log('[AGENT:THINK] Analyzing video context...');

        // Transcribe if not already done
        if (!this.state.transcription) {
            console.log('[AGENT:THINK] Transcribing audio...');
            const result = await transcribeAudio(this.state.videoPath);
            this.state.transcription = result.text;
            this.state.words = result.words || [];
        }

        // Detect video tone and content type
        const toneAnalysis = this.detectTone(this.state.transcription);
        console.log(`[AGENT:THINK] Detected tone: ${toneAnalysis.tone}, Pace: ${toneAnalysis.pace}`);

        // Identify key moments
        const keyMoments = this.findKeyMoments(this.state.transcription);
        console.log(`[AGENT:THINK] Found ${keyMoments.length} potential key moments`);
    }

    /**
     * PLAN: Create step-by-step execution plan
     */
    private plan(targetCount: number): {
        segmentCount: number;
        captionStrategy: string;
        hookPlacement: string;
        paceTarget: string;
    } {
        // Decide clip strategy based on content
        const videoDuration = this.state.duration;
        const hasHighPace = this.state.transcription.length > 5000;

        return {
            segmentCount: Math.ceil(targetCount * 1.5), // Generate 50% more, keep best
            captionStrategy: hasHighPace ? 'aggressive' : 'spaced',
            hookPlacement: 'immediate', // Hook in first 2 seconds
            paceTarget: 'fast' // For shorts
        };
    }

    /**
     * ACT: Execute the plan and generate clips
     */
    private async act(plan: any): Promise<void> {
        console.log('[AGENT:ACT] Generating clips based on plan...');

        // Use analysis service to find moments
        const moments = await analyzeTranscript(this.state.transcription, this.state.duration);

        // Filter moments to those with high engagement potential
        const topMoments = moments
            .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
            .slice(0, plan.segmentCount);

        console.log(`[AGENT:ACT] Selected ${topMoments.length} moments for clip generation`);

        // Generate Clip objects
        this.state.generatedClips = topMoments.map((moment: any, idx: number) => ({
            id: `${idx}`,
            start: moment.start,
            end: moment.end,
            text: moment.text,
            words: this.state.words.filter(
                w => w.start >= moment.start && w.end <= moment.end
            ),
            score: moment.score,
            reason: moment.reason,
            theme: {
                captionStyle: this.getOptimalCaptionStyle(moment),
                captionColor: this.getOptimalCaptionColor(moment),
                bgMusicUrl: undefined,
                bgMusicVolume: 0.3,
                zoomIntensity: 0.7,
                voiceoverUrl: undefined
            }
        }));
    }

    /**
     * OBSERVE: Evaluate generated clips
     */
    private async observe(): Promise<void> {
        console.log('[AGENT:OBSERVE] Scoring all generated clips...');

        this.state.scoredClips = this.state.generatedClips.map(clip => {
            const scored = this.scoreClip(clip);
            return scored;
        });

        // Log scoring results
        const avgScore = this.state.scoredClips.reduce((sum, c) => sum + c.overallScore, 0) / this.state.scoredClips.length;
        console.log(`[AGENT:OBSERVE] Average clip score: ${avgScore.toFixed(2)}/10`);
        console.log(`[AGENT:OBSERVE] Clips above threshold: ${this.state.scoredClips.filter(c => !c.shouldDiscard).length}/${this.state.scoredClips.length}`);
    }

    /**
     * REFLECT: Self-critique and analysis
     */
    private reflect(): void {
        console.log('[AGENT:REFLECT] Analyzing results...');

        const goodClips = this.state.scoredClips.filter(c => c.overallScore >= this.state.qualityThreshold);
        const badClips = this.state.scoredClips.filter(c => c.overallScore < this.state.qualityThreshold);

        this.reflection.whatWorked = [
            ...goodClips.map(c => `Hook: "${c.text.substring(0, 30)}..." (score: ${c.overallScore})`),
            `Caption style mix: ${[...new Set(this.state.scoredClips.map(c => c.theme.captionStyle))].join(', ')}`
        ];

        this.reflection.whatFailed = badClips.map(c => c.regenerationReason || 'Low engagement');

        this.reflection.improvements = [
            badClips.length > 0 ? `Regenerate ${badClips.length} weak clips` : 'All clips above threshold',
            'Increase emotional impact scoring weight',
            'Optimize caption timing for clarity'
        ];

        this.reflection.nextStrategy = badClips.length > 0 
            ? 'Focus on clips with weak hooks, regenerate with stronger openers'
            : 'Current strategy working well, maintain approach';
    }

    /**
     * IMPROVE: Regenerate clips below quality threshold
     */
    private async improve(targetCount: number): Promise<void> {
        const badClips = this.state.scoredClips.filter(c => c.shouldDiscard);
        console.log(`[AGENT:IMPROVE] Attempting to improve ${badClips.length} weak clips`);

        if (badClips.length === 0) {
            console.log('[AGENT:IMPROVE] All clips meet quality threshold, no regeneration needed');
            return;
        }

        // Filter to top performing clips
        this.state.scoredClips = this.state.scoredClips
            .filter(c => !c.shouldDiscard)
            .sort((a, b) => b.overallScore - a.overallScore)
            .slice(0, targetCount);

        console.log(`[AGENT:IMPROVE] Kept ${this.state.scoredClips.length} high-quality clips`);
    }

    /**
     * Score a single clip
     */
    private scoreClip(clip: Clip): ScoredClip {
        const text = clip.text;
        
        // Hook Strength (1-10): Does it grab attention immediately?
        const hookStrength = this.scoreHookStrength(text);
        
        // Emotional Impact (1-10): Does it resonate emotionally?
        const emotionalImpact = this.scoreEmotionalImpact(text);
        
        // Clarity (1-10): Is the message clear in 10-15 seconds?
        const clarity = this.scoreClarity(text, clip);
        
        // Platform Suitability
        const platformSuitability = {
            reels: this.scorePlatformFit(text, 'reels'),
            shorts: this.scorePlatformFit(text, 'shorts'),
            tiktok: this.scorePlatformFit(text, 'tiktok')
        };
        
        const overallScore = (hookStrength + emotionalImpact + clarity + 
            (platformSuitability.reels + platformSuitability.shorts + platformSuitability.tiktok) / 3) / 4;
        
        const shouldDiscard = overallScore < this.state.qualityThreshold;
        
        return {
            ...clip,
            hookStrength,
            emotionalImpact,
            clarity,
            platformSuitability,
            overallScore: Math.round(overallScore * 10) / 10,
            shouldDiscard,
            regenerationReason: shouldDiscard ? this.getRegenerationReason(hookStrength, emotionalImpact, clarity) : undefined
        };
    }

    private scoreHookStrength(text: string): number {
        // Check for attention-grabbing words
        const hookWords = ['shocking', 'unbelievable', 'revealed', 'finally', 'never', 'wait', 'actually', 'trust'];
        const containsHook = hookWords.some(word => text.toLowerCase().includes(word));
        
        // Check length (shorter hooks are stronger)
        const wordCount = text.split(' ').length;
        const lengthScore = Math.max(3, 10 - (wordCount / 2));
        
        return Math.min(10, (containsHook ? 7 : 5) + (lengthScore / 5));
    }

    private scoreEmotionalImpact(text: string): number {
        const emotionalKeywords = ['amazing', 'love', 'hate', 'shocking', 'incredible', 'devastating', 'beautiful'];
        const count = emotionalKeywords.filter(word => text.toLowerCase().includes(word)).length;
        return Math.min(10, 5 + (count * 1.5));
    }

    private scoreClarity(text: string, clip: Clip): number {
        // Duration check (10-15 seconds is ideal)
        const duration = clip.end - clip.start;
        const durationScore = duration > 10 && duration < 15 ? 10 : Math.max(3, 10 - Math.abs(duration - 12.5));
        
        // Sentence count (1-3 clear sentences is ideal)
        const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
        const sentenceScore = sentences >= 1 && sentences <= 3 ? 9 : Math.max(3, 10 - sentences);
        
        return (durationScore + sentenceScore) / 2;
    }

    private scorePlatformFit(text: string, platform: 'reels' | 'shorts' | 'tiktok'): number {
        // All platforms: short, engaging content
        const baseScore = text.length < 100 ? 8 : 6;
        
        // Platform-specific: could add more sophisticated scoring
        return baseScore;
    }

    private getRegenerationReason(hook: number, emotion: number, clarity: number): string {
        if (hook < 5) return 'Weak hook - needs stronger opener';
        if (emotion < 5) return 'Low emotional impact - add more resonance';
        if (clarity < 5) return 'Poor clarity - message unclear';
        return 'Below quality threshold - requires optimization';
    }

    /**
     * Helper: Detect video tone and pace
     */
    private detectTone(text: string): { tone: string; pace: string } {
        const energyWords = text.split(' ').filter(w => 
            /[A-Z]/.test(w) || w.includes('!') || w.includes('?')
        ).length;
        
        return {
            tone: energyWords > text.split(' ').length * 0.3 ? 'high_energy' : 'calm',
            pace: text.length > 5000 ? 'fast' : 'medium'
        };
    }

    /**
     * Helper: Find key moments in transcript
     */
    private findKeyMoments(text: string): Array<{ start: number; end: number; importance: number }> {
        // Simplified: would use more advanced NLP in production
        return [];
    }

    /**
     * Helper: Get optimal caption style for moment
     */
    private getOptimalCaptionStyle(moment: any): 'pop' | 'bounce' | 'slide' | 'neon' | 'fade' {
        const styles: Array<'pop' | 'bounce' | 'slide' | 'neon' | 'fade'> = ['pop', 'bounce', 'slide'];
        return styles[Math.floor(Math.random() * styles.length)];
    }

    /**
     * Helper: Get optimal caption color
     */
    private getOptimalCaptionColor(moment: any): string {
        const colors = ['#ffffff', '#ffff00', '#00ff00', '#ff00ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Get reflection for logging
     */
    getReflection(): AgentReflection {
        return this.reflection;
    }
}
