/**
 * Vitala Symptom Analysis Service
 * Communicates securely with backend API layer (Vite backend proxy / server)
 * Never exposes the Gemini API key to client browser code.
 */

export async function analyzeSymptomsWithGemini(symptomsText) {
  if (!symptomsText || symptomsText.trim().length === 0) {
    throw new Error("Please enter a description of your symptoms.");
  }

  const response = await fetch("/api/analyze-symptoms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      symptoms: symptomsText.trim(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to process symptom analysis. Please try again.");
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Analysis failed.");
  }

  return result.data;
}
