// src/services/structure.service.js
import { extractWithRegex } from "./regexExtractor.js";
import { extractWithLocalLLM } from "./llmExtractor.js";

export const extractStructuredData = async (rawText) => {
  // 1️. Try Regex first
  const regexResult = extractWithRegex(rawText);

  if (regexResult.confidence === "high") {
    return {
      ...regexResult,
      source: "regex"
    };
  }

  // 2. Fallback to Local LLM
  const llmResult = await extractWithLocalLLM(rawText);

  return {
    ...llmResult,
    fallback_from: "regex"
  };
};

