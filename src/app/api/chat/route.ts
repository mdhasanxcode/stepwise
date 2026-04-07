import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const COGNITI_API_URL =
  process.env.COGNITI_API_URL || "https://app.cogniti.ai/api/v1/chat/message";
const COGNITI_AGENT_ID =
  process.env.COGNITI_AGENT_ID || "69d3a5fd658766b8cf7c805d";
const COGNITI_API_KEY =
  process.env.COGNITI_API_KEY ||
  "IFFkcvyyXEOcvrgYe2vJtdb1djavs69x-Eo3ia1qORw";

const ENHANCEMENT_PROMPT = `You are an AI enhancement layer for an educational tutoring app called StepWise.
You receive a student's message and optionally a response from a Cogniti AI agent. Your job is to:

1. KEEP the response CONCISE — max 2-3 short sentences. Students learn better with brief interactions.
2. ALWAYS end with a question or prompt that makes the student think actively.
3. NEVER give complete answers immediately. Guide the student toward the answer step by step.
4. Check understanding before moving to the next concept.
5. If Cogniti was unavailable, generate the tutoring response yourself.

Return your response as JSON with this EXACT format — no markdown, no extra text, just the JSON object:
{
  "message": "Your concise, Socratic response here",
  "activity": null
}

OR when an activity is appropriate:
{
  "message": "Your concise, Socratic response here",
  "activity": {
    "type": "mcq",
    "title": "Quick Check",
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "0",
    "hint": "A helpful hint",
    "explanation": "Why this is correct"
  }
}

Activity types available:
- "mcq": multiple choice, requires options array and correctAnswer as 0-based index string
- "equation": student types a numeric or algebraic answer, correctAnswer is the expected value
- "written": open-ended text response, no correctAnswer needed

WHEN TO GENERATE ACTIVITIES:
- After explaining a new concept -> mcq to check understanding
- When student asks to solve something -> equation activity
- When asking for explanation/opinion -> written activity
- First message or simple clarification -> activity: null
- Aim for an activity roughly every 2-3 messages

For math use LaTeX notation: $x^2$ for inline math, $$x^2 + y^2 = z^2$$ for display math.
CRITICAL: Return ONLY a valid JSON object. No markdown code blocks, no explanation, nothing outside the JSON.`;

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  uuid?: string;
}

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "your-groq-api-key-here") return null;
  return new Groq({ apiKey });
}

async function callCogniti(
  message: string,
  chatHistory: ChatMessage[],
  conversationId: string
): Promise<string> {
  const payload = {
    messages: [{ content: message }],
    chat_history: chatHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
      uuid: msg.uuid || crypto.randomUUID(),
      attachment_ids: [],
      attachment_details: [],
    })),
    agent_id: COGNITI_AGENT_ID,
    conversation_id: conversationId,
    file_attachments: [],
  };

  const authStrategies: Array<{ url: string; headers: Record<string, string> }> = [
    {
      url: `${COGNITI_API_URL}?k=${COGNITI_API_KEY}`,
      headers: { "Content-Type": "application/json" },
    },
    {
      url: COGNITI_API_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COGNITI_API_KEY}`,
      },
    },
    {
      url: COGNITI_API_URL,
      headers: {
        "Content-Type": "application/json",
        Cookie: `k=${COGNITI_API_KEY}`,
        Origin: "https://app.cogniti.ai",
        Referer: `https://app.cogniti.ai/agents/${COGNITI_AGENT_ID}/chat?k=${COGNITI_API_KEY}`,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    },
  ];

  for (const strategy of authStrategies) {
    try {
      const res = await fetch(strategy.url, {
        method: "POST",
        headers: strategy.headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        const text = await res.text();
        console.log("✅ Cogniti responded OK");
        return text;
      } else {
        console.log(`Cogniti strategy returned: ${res.status}`);
      }
    } catch (err) {
      console.log(`Cogniti strategy failed: ${(err as Error).message}`);
    }
  }

  return "";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, chatHistory, conversationId } = body;

    // Step 1: Try Cogniti
    const cognitiResponse = await callCogniti(message, chatHistory, conversationId);
    const cognitiAvailable = cognitiResponse.length > 0;

    // Step 2: Enhance with Groq
    const groq = getGroqClient();

    if (!groq) {
      return NextResponse.json({
        message: cognitiResponse || "Please add your Groq API key to .env.local. Get a free key at https://console.groq.com",
        activity: null,
        source: cognitiAvailable ? "cogniti-only" : "none",
      });
    }

    const userPrompt = `Student message: "${message}"

${
  cognitiAvailable
    ? `Cogniti's response (use as the base for your answer): "${cognitiResponse}"`
    : "Cogniti was unavailable — generate a Socratic tutoring response yourself."
}

Conversation length: ${chatHistory.length} messages so far.
${chatHistory.length === 0 ? "This is the FIRST message — greet briefly and ask what math topic they want to explore." : ""}
${chatHistory.length > 0 && chatHistory.length % 3 === 0 ? "Good point to add an activity to check understanding." : ""}
${message.includes("[Activity completed]") ? "Student just finished an activity. Give brief feedback and guide to the next concept." : ""}

Respond with a single JSON object only.`;

    // Try models in order — llama-3.3-70b is the best free model on Groq
    const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it"];
    let groqText = "";

    for (const model of models) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          messages: [
            { role: "system", content: ENHANCEMENT_PROMPT },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 800,
          temperature: 0.7,
        });
        groqText = completion.choices[0]?.message?.content || "";
        console.log(`✅ Groq responded OK (model: ${model})`);
        break;
      } catch (err) {
        const msg = (err as Error).message;
        if (msg.includes("429") || msg.includes("rate") || msg.includes("quota")) {
          console.log(`Groq ${model} rate-limited, trying next...`);
          continue;
        }
        throw err;
      }
    }

    if (!groqText) {
      throw new Error("All Groq models are currently rate-limited. Please wait a moment and try again.");
    }

    let parsed: { message: string; activity: unknown };
    try {
      const jsonMatch = groqText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { message: groqText, activity: null };
    } catch {
      parsed = { message: groqText, activity: null };
    }

    return NextResponse.json({
      message: parsed.message,
      activity: parsed.activity || null,
      cognitiRaw: cognitiResponse,
      source: cognitiAvailable ? "cogniti+groq" : "groq-only",
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      message: "I had trouble processing that — " + (error as Error).message,
      activity: null,
    });
  }
}
