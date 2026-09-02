import { evaluateHealthMeasurements } from "./predictEngine";

/**
 * Vitala Predict Service
 * Client communication service with backend Predict endpoint (/api/analyze-health-measurements).
 * Automatically ensures full parsedValues and chartable parameter results.
 */
export async function submitHealthMeasurements(measurements) {
  try {
    const response = await fetch("/api/analyze-health-measurements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ measurements }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result && result.success && result.data) {
        const data = result.data;
        // Ensure parsedValues exists for charts & graphs rendering
        if (!data.parsedValues) {
          data.parsedValues = {
            age: parseFloat(measurements.age) || 35,
            heartRate: parseFloat(measurements.heartRate) || 72,
            systolicBP: parseFloat(measurements.systolicBP) || 120,
            diastolicBP: parseFloat(measurements.diastolicBP) || 80,
            bodyTemp: parseFloat(measurements.bodyTemp) || 98.6,
            spO2: parseFloat(measurements.spO2) || 98,
            respiratoryRate: parseFloat(measurements.respiratoryRate) || 16,
            bloodGlucose: parseFloat(measurements.bloodGlucose) || 95,
            thyroid: parseFloat(measurements.thyroid) || 1.8,
          };
        }
        if (data.parameterResults && data.parameterResults.length > 0) {
          return data;
        }
      }
    }
  } catch (err) {
    console.warn("[PredictService] API request fell back to client clinical engine:", err);
  }

  // Guaranteed fallback using client-side clinical rule engine
  return evaluateHealthMeasurements(measurements);
}
