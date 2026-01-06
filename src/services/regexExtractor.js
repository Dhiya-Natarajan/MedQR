// src/services/regexExtractor.js
export const extractWithRegex = (rawText) => {
  if (!rawText) {
    return { confidence: "low" };
  }

  const cleanText = rawText.toLowerCase().replace(/\n/g, " ").trim();

  const result = {
    diagnosis: null,
    medication: null,
    confidence: "medium"
  };

   // 3. Extraction Logic using Regex
  // We look for patterns like "dx:", "diagnosis:", "rx:", "treatment:"
  
  // Regex Explanation:
  // (?:diagnosis|dx|diag) -> match variations of diagnosis
  // [.:\s]+                -> match separator like ": " or " " or "."
  // (.*?)                  -> capture content non-greedily
  // (?=rx|tx|treatment|$)  -> stop when you see "Rx" or end of string
  

  const diagnosisMatch = cleanText.match(
    /(?:diagnosis|dx|diag)[.:\s]+(.*?)(?=\s*(?:rx|tx|treatment|$))/i
  );

  const rxMatch = cleanText.match(
    /(?:rx|tx|treatment)[.:\s]+(.*?)(?=$)/i
  );

    if (diagnosisMatch && diagnosisMatch[1]) {
    result.diagnosis = fixMedicalTypos(diagnosisMatch[1].trim());
  }

  if (rxMatch && rxMatch[1]) {
    result.rx = fixMedicalTypos(rxMatch[1].trim());
  }

  // Fallback: If regex failed, put everything in "notes"
  if (!result.diagnosis && !result.rx) {
    result.raw_notes = rawText;
    result.confidence = "low";
  }

  return result;
};

// Simple helper to fix common OCR errors in specific medicines
function fixMedicalTypos(text) {
  const commonCorrections = {
    "malavia": "malaria",
    "maleria": "malaria",
    "artesunote": "artesunate",
    "artsunat": "artesunate",
    "panado": "panadol",
    "typhid": "typhoid"
  };

  return text.split(/\s+/).map(word => {
    const clean = word.replace(/[^\w]/g, "");
    return commonCorrections[clean] || word;
  }).join(" ");

}