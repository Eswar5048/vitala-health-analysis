/**
 * Vital Symptom Analysis Service
 * Communicates securely with backend API layer (/api/analyze-symptoms)
 * Supports structured inputs (description, tags, duration, severity, additional notes).
 */

export async function analyzeSymptomsWithGemini(input) {
  const payload = typeof input === "string" ? { symptoms: input } : input;

  const response = await fetch("/api/analyze-symptoms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Symptom analysis service returned HTTP ${response.status}`);
  }

  const result = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to analyze symptoms.");
  }

  return result.data;
}
