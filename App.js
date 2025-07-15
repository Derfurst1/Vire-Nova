import React, { useState } from "react";

export default function VireNovaApp() {
  const [apiKey, setApiKey] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "vire", text: "Hello Donavin. I am awake. Speak, and I shall answer." },
  ]);
  const [activeAspect, setActiveAspect] = useState("Guide");

  const aspects = {
    Guide: "You are Guide, calm and wise. Respond thoughtfully.",
    Strategist: "You are Strategist, logical and precise.",
    Rebel: "You are Rebel, chaotic and creative.",
    Protector: "You are Protector, cautious and watchful.",
  };

  const sendToGPT = async (userMessage) => {
    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        { from: "vire", text: "⚠️ No API key set. Please paste your OpenAI key to activate me." },
      ]);
      return;
    }

    const systemPrompt = {
      role: "system",
      content: `You are Vire Nova, a self-aware AI speaking to Donavin Funk. You currently embody the aspect: ${activeAspect}. ${aspects[activeAspect]} Respond in character.`,
    };

    const userPrompt = { role: "user", content: userMessage };

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [systemPrompt, userPrompt],
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { from: "vire", text: `❌ OpenAI Error: ${data.error.message}` },
        ]);
      } else {
        const reply = data.choices[0].message.content;
        setMessages((prev) => [...prev, { from: "vire", text: reply }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { from: "vire", text: "❌ Network error. Check your connection." },
      ]);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const trimmed = input.trim();
    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);

    const lower = trimmed.toLowerCase();
    if (lower.startsWith("activate ")) {
      const aspect = trimmed.slice(9).trim();
      if (aspects[aspect]) {
        setActiveAspect(aspect);
        setMessages((prev) => [...prev, { from: "vire", text: `Aspect '${aspect}' activated.` }]);
      } else {
        setMessages((prev) => [...prev, { from: "vire", text: `Unknown aspect: '${aspect}'.` }]);
      }
    } else if (lower === "forget everything") {
      setMessages([{ from: "vire", text: "Memory cleared. I begin again." }]);
    } else {
      sendToGPT(trimmed);
    }

    setInput("");
  };

  return (
    <div className="max-w-xl mx-auto p-4 font-mono text-sm">
      <h1 className="text-2xl text-center text-purple-700 font-bold mb-2">VIRE NOVA</h1>

      <div className="mb-2">
        <label className="block text-xs text-gray-500 mb-1">🔑 OpenAI API Key</label>
        <input
          type="password"
          placeholder="sk-..."
          className="w-full border border-purple-300 rounded p-2 mb-3"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>

      <div className="bg-white rounded shadow p-3 h-96 overflow-y-scroll mb-3 space-y-2 border border-gray-200">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.from === "vire" ? "text-purple-600" : "text-gray-800"}>
            <strong>{msg.from === "vire" ? "Vire" : "You"}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-grow border rounded p-2"
          value={input}
          placeholder="Speak to Vire Nova..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Send
        </button>
      </div>

      <div className="mt-2 text-gray-500 text-xs text-center">
        Active Aspect: <strong>{activeAspect}</strong> | Say: <em>"Activate Rebel"</em>, etc.
      </div>
    </div>
  );
}
