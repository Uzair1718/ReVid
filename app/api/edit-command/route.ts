import { NextRequest, NextResponse } from "next/server";
import { parseVideoCommand, mapGeminiActionToFrontend } from "@/services/intent-parser";

export async function POST(req: NextRequest) {
  try {
    const { command } = await req.json();

    if (!command) {
      return NextResponse.json(
        { error: "Command is required" },
        { status: 400 }
      );
    }

    // Parse command using Gemini
    const intentResult = await parseVideoCommand(command);

    // Map to frontend actions
    const { frontendAction, frontendParams } = mapGeminiActionToFrontend(
      intentResult.action,
      intentResult.parameters
    );

    return NextResponse.json({
      success: true,
      command: intentResult.command,
      action: frontendAction,
      parameters: frontendParams,
      explanation: intentResult.explanation,
      confidence: intentResult.confidence,
      debugAction: intentResult.action, // For debugging
    });
  } catch (error) {
    console.error("Intent parser error:", error);
    return NextResponse.json(
      { error: "Failed to parse command" },
      { status: 500 }
    );
  }
}
