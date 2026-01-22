import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface IntentParseResult {
  command: string;
  action: string;
  parameters: Record<string, any>;
  explanation: string;
  confidence: number;
}

const SYSTEM_PROMPT = `You are a video editing command parser for an AI-native video editor. 
Your job is to understand natural language commands and convert them into structured actions.

Available actions:
1. CAPTION_STYLE: Change caption appearance (params: style=['pop','fade','bounce','neon','slide'], color=[hex])
2. CAPTION_SIZE: Adjust caption size (params: size=['small','medium','large'])
3. ANIMATION_SPEED: Adjust animation speed (params: multiplier=[0.5-2.0])
4. ZOOM_INTENSITY: Control zoom effects (params: intensity=[0-1])
5. EMOTION_SYNC: Sync animations to emotional intensity (params: enabled=[true/false])
6. PLATFORM_OPTIMIZE: Optimize for platform (params: platform=['tiktok','instagram','youtube','twitter','linkedin'])
7. AUDIO_EMPHASIS: Emphasize audio moments (params: type=['beat','voice','music','silence'])
8. COLOR_GRADE: Apply color grading (params: grade=['warm','cool','vibrant','cinematic','retro'])
9. PLAYBACK_SPEED: Change playback speed (params: speed=['0.5x','0.75x','1x','1.25x','1.5x','2x'])
10. EFFECT_ADD: Add visual effect (params: effect=['glitch','blur','vignette','chromatic','parallax'])

For each command:
1. Identify the primary action
2. Extract parameters from the user's natural language
3. Estimate confidence (0-1) based on clarity of intent
4. Provide a brief explanation of what will happen

Always respond with valid JSON.`;

export async function parseVideoCommand(userCommand: string): Promise<IntentParseResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${SYSTEM_PROMPT}

User command: "${userCommand}"

Respond with ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "command": "user's original command",
  "action": "ACTION_NAME",
  "parameters": { /* action-specific params */ },
  "explanation": "what will happen",
  "confidence": 0.0-1.0
}`,
            },
          ],
        },
      ],
    });

    const responseText =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]) as IntentParseResult;
    return parsed;
  } catch (error) {
    console.error("Error parsing command:", error);
    // Fallback to basic parsing
    return {
      command: userCommand,
      action: "UNKNOWN",
      parameters: {},
      explanation: "Command not understood. Try: 'make captions aggressive', 'zoom in', 'optimize for tiktok'",
      confidence: 0,
    };
  }
}

// Map Gemini actions to frontend actions
export function mapGeminiActionToFrontend(
  action: string,
  params: Record<string, any>
): { frontendAction: string; frontendParams: Record<string, any> } {
  const actionMap: Record<string, string> = {
    CAPTION_STYLE: "caption_style",
    CAPTION_SIZE: "caption_size",
    ANIMATION_SPEED: "animation_speed",
    ZOOM_INTENSITY: "zoom_intensity",
    EMOTION_SYNC: "emotion_sync",
    PLATFORM_OPTIMIZE: "platform_optimize",
    AUDIO_EMPHASIS: "audio_emphasis",
    COLOR_GRADE: "color_grade",
    PLAYBACK_SPEED: "playback_speed",
    EFFECT_ADD: "effect_add",
  };

  return {
    frontendAction: actionMap[action] || "unknown",
    frontendParams: params,
  };
}
