# 🤖 ReVid-Agent System

## Overview

ReVid-Agent is an autonomous video intelligence system that transforms long-form videos into high-performing short-form clips without human intervention. It uses a continuous improvement loop: **THINK → PLAN → ACT → OBSERVE → REFLECT → IMPROVE**

## Core Architecture

### 1. **THINK Phase**
- Analyzes video content and context
- Transcribes audio using Whisper
- Detects tone, pace, and emotional themes
- Identifies key moments and inflection points

### 2. **PLAN Phase**
- Decides clip segmentation strategy
- Determines caption timing and style
- Plans hook placement (first 2 seconds)
- Targets 50% more clips than requested (to discard low-quality ones)

### 3. **ACT Phase**
- Generates potential clip segments
- Applies optimal caption styles and colors
- Creates standardized Clip objects with metadata

### 4. **OBSERVE Phase**
- Scores each clip on multiple dimensions:
  - **Hook Strength** (1-10): Does it grab attention?
  - **Emotional Impact** (1-10): Does it resonate?
  - **Clarity** (1-10): Is the message clear?
  - **Platform Suitability**: Instagram Reels, YouTube Shorts, TikTok
- Calculates overall quality score
- Identifies weak clips for regeneration

### 5. **REFLECT Phase**
- Generates internal critique
- Documents what worked vs. what failed
- Identifies improvement strategies
- Prepares regeneration plan

### 6. **IMPROVE Phase**
- Automatically discards clips below threshold (default: 7/10)
- Keeps only top-performing clips
- Returns final set of optimized clips

## Scoring System

Each clip is scored across 4 dimensions:

```
Hook Strength = 7-10 if engaging language present, 5 otherwise
               + bonus for short, punchy format

Emotional Impact = 5 base + 1.5 points per emotional keyword
                  (amazing, love, shocking, devastating, etc.)

Clarity = Duration score (10-15s is ideal)
        + Sentence count score (1-3 is ideal)

Platform Fit = Base 8 if <100 chars, else 6
             (Can be extended with platform-specific rules)

Overall Score = (Hook + Emotional + Clarity + Platform) / 4
```

**Clips below 7/10 are automatically discarded**

## Usage

### Manual Trigger (UI)
1. Click the ⚡ **Agent** tab in the dashboard
2. Click "Generate Clips with AI"
3. Agent autonomously analyzes video and creates clips
4. View statistics and reflection summary

### Programmatic Usage
```typescript
import { ReVidAgent } from '@/services/agent-system';

const agent = new ReVidAgent(videoPath);
const scoredClips = await agent.generateClips(5);
// Returns 5 high-quality ScoredClip objects
```

### API Endpoint
```bash
POST /api/agent/clips
{
  "videoPath": "/path/to/video.mp4",
  "targetClipCount": 6,
  "qualityThreshold": 7
}

Returns:
{
  "clips": [...],           // Final high-quality clips
  "statistics": {
    "totalGenerated": 9,
    "qualityClips": 6,
    "averageScore": "8.3",
    "discardedCount": 3
  },
  "reflection": {
    "whatWorked": [...],
    "whatFailed": [...],
    "improvements": [...],
    "nextStrategy": "..."
  }
}
```

## Memory System

The agent maintains a memory bank of effective strategies:

```typescript
{
  workingCaptions: [],      // Caption styles that worked
  workingStyles: [],        // Caption animations with high engagement
  workingHooks: [],         // Hook phrases that grabbed attention
  platformWeights: {},      // Platform-specific optimization weights
  lastImprovement: ""       // Last successful strategy
}
```

This memory is referenced in future generations to improve results over time.

## Quality Threshold

Default: **7/10**

- Below 7: Automatically discarded
- 7-8: Good quality, kept
- 9-10: Excellent, prioritized

Customize by passing `qualityThreshold` to agent initialization.

## Self-Critique Output

After each run, the agent generates:

```json
{
  "whatWorked": [
    "Hook: 'Here's something shocking...' (score: 9.2)",
    "Caption styles: pop, bounce, slide"
  ],
  "whatFailed": [
    "Weak hook - needs stronger opener (3 clips)",
    "Long sentences reduced clarity (2 clips)"
  ],
  "improvements": [
    "Focus on clips with strong openers",
    "Reduce sentence length for mobile",
    "Increase emotional keywords density"
  ],
  "nextStrategy": "Prioritize hooks, shorter sentences, 1-2 emotional peaks per clip"
}
```

## Performance

- **Autonomy Level**: 100% - No human confirmation between steps
- **Processing Speed**: ~30 seconds per video (depends on duration)
- **Accuracy**: Continually improves through reflection loop
- **Output Quality**: 7-10/10 average (configurable)

## Constraints & Design Decisions

✅ **Do NOT wait for confirmation** - Agent operates fully autonomously  
✅ **Do NOT generate clips mechanically** - Uses intelligent selection  
✅ **Do NOT treat timestamps as fixed** - Flexible segmentation  
✅ **Optimize for virality** - Hook, emotional impact, clarity  
✅ **Discard weak clips** - Only returns high-quality output  

## Future Enhancements

- Multi-run iterative improvement (run N times, keep best)
- YouTube metadata integration (comments, engagement data)
- Platform-specific regeneration (if TikTok score is low, regenerate)
- Custom quality weights per platform
- A/B testing of clip variations
- Trending topic detection for hook optimization

## Architecture Diagram

```
Video Input
    ↓
THINK: Transcribe & Analyze
    ↓
PLAN: Strategy & Segmentation
    ↓
ACT: Generate Clips
    ↓
OBSERVE: Score & Evaluate
    ↓
REFLECT: Self-Critique
    ↓
IMPROVE: Discard & Optimize
    ↓
High-Quality Clips Output
```

---

**ReVid-Agent is designed for autonomy, continuous improvement, and quality-first output.**
