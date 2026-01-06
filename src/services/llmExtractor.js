// src/services/llmExtractor.js
import fetch from "node-fetch";

export const extractWithLocalLLM = async (rawText) => {
  const prompt = `
  Task: Convert this OCR text from a doctor's note into JSON.
  Context: The text may contain typos. Fix them based on medical context.
  Input Text: "${rawText}"

  Output Format: JSON only
  {
    "diagnosis": "string",
    "medication": "string"
  }
  `;

  try {
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        prompt: prompt,
        stream: false,
        format: "json"
      }),
    });

    const data = await response.json();
    const parsed = JSON.parse(data.response);

    return {
      ...parsed,
      confidence: "medium",
      source: "llm"
    };

  } catch (err) {
    console.error("LLM failed:", err);
    return {
      diagnosis: null,
      medication: null,
      confidence: "low",
      source: "llm_error"
    };
  }
};
