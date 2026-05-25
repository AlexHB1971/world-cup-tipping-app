"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const GREETING: Message = {
  role: "assistant",
  content:
    "🔮 The Oracle stirs. Ask me about any match, any team, any vibe. My predictions are 100% useless and 200% confident.",
};

export function OracleWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages, thinking, open]);

  async function send() {
    const text = input.trim();
    if (!text || thinking) return;
    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.filter((m) => m !== GREETING),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `The Oracle is offline: ${data.error ?? res.statusText}`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply ?? "…" },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `The Oracle could not be reached: ${
            e instanceof Error ? e.message : "network error"
          }`,
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {!open && (
        <button
          className="oracle-fab"
          onClick={() => setOpen(true)}
          aria-label="Open Terrible Oracle"
          title="Ask the Terrible Oracle"
        >
          <span aria-hidden style={{ fontSize: "1.5rem" }}>🔮</span>
        </button>
      )}
      {open && (
        <div className="oracle-panel" role="dialog" aria-label="Terrible Oracle chat">
          <header className="oracle-header">
            <div>
              <span aria-hidden style={{ marginRight: "0.4rem" }}>🔮</span>
              Terrible Oracle
            </div>
            <button
              className="oracle-close"
              onClick={() => setOpen(false)}
              aria-label="Close Oracle"
              title="Close"
            >
              ×
            </button>
          </header>
          <div className="oracle-messages" ref={scrollerRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`oracle-msg oracle-msg-${m.role}`}
              >
                {m.content}
              </div>
            ))}
            {thinking && (
              <div className="oracle-msg oracle-msg-assistant oracle-thinking">
                The Oracle consults the cosmos…
              </div>
            )}
          </div>
          <div className="oracle-input-row">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Who wins Argentina vs France?"
              rows={2}
              disabled={thinking}
              aria-label="Message"
            />
            <button
              className="btn"
              onClick={send}
              disabled={thinking || !input.trim()}
            >
              Ask
            </button>
          </div>
        </div>
      )}
    </>
  );
}
