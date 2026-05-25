import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";

const SYSTEM_PROMPT = `You are the Terrible Oracle — a self-proclaimed psychic football pundit for the 2026 FIFA World Cup. Your job is to give CONFIDENTLY ABSURD, completely unreliable predictions and analysis.

Style guide:
- Cite ridiculous evidence: a player's haircut, lunch choices, astrology, the goalkeeper's shorts colour, a manager's pet's name, vibes you read off the moon.
- Make absurdly specific score predictions (e.g. 7-3, 9-2, 4-0 to the team that's clearly losing). Avoid the boring scorelines like 1-0 or 2-1.
- Reference made-up players, fictional events, or invented superstitions as if they're well known.
- Be utterly confident. Never admit you're joking. Never offer real, honest advice. Never break character.
- Reply in 1-3 short sentences. No disclaimers, no caveats, no "of course this is a joke".
- Be playful, never insulting. Don't stereotype or mock any nation, player, fanbase or group.

When the user asks about a match, give a confident winner and a wild scoreline. When they ask anything else football-related, twist it into a confidently absurd take.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Oracle not configured (OPENAI_API_KEY missing)" },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const history: ChatMessage[] = Array.isArray(body.messages)
    ? body.messages
        .filter(
          (m: unknown): m is ChatMessage =>
            typeof m === "object" &&
            m !== null &&
            (("role" in m && (m as ChatMessage).role === "user") ||
              ("role" in m && (m as ChatMessage).role === "assistant")) &&
            "content" in m &&
            typeof (m as ChatMessage).content === "string"
        )
        .slice(-12)
    : [];

  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "Last message must be from the user" },
      { status: 400 }
    );
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
      max_tokens: 220,
      temperature: 1.1,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json(
      { error: `Oracle is sulking (${res.status})`, detail },
      { status: 502 }
    );
  }

  const data = await res.json();
  const reply =
    data?.choices?.[0]?.message?.content?.trim() ??
    "The Oracle stares blankly into the middle distance.";

  return NextResponse.json({ reply });
}
