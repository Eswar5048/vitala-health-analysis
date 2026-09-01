/**
 * Vitala Predict Service
 * Client communication service with backend Predict endpoint (/api/analyze-health-measurements).
 * Uses GEMINI_HEALTH_API_KEY securely configured on backend.
 */

export async function submitHealthMeasurements(measurements) {
  const response = await fetch("/api/analyze-health-measurements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ measurements }),
  });

  if (!response.ok) {
    throw new Error("Failed to process health measurements. Please try again.");
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Analysis failed.");
  }

  return result.data;
}
