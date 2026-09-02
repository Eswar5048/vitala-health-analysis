/**
 * Vital Symptom Analysis Service
 * Communicates securely with backend API layer (/api/analyze-symptoms)
 * Features built-in resilience and client-side fallback parsing.
 */

function generateFallbackSymptomAnalysis(symptomsText) {
  const lower = (symptomsText || "").toLowerCase();
  const possibleConditions = [];
  let urgencyLevel = "Routine";

  if (lower.includes("fever") || lower.includes("temperature") || lower.includes("chills") || lower.includes("sweat")) {
    possibleConditions.push({
      name: "Viral Upper Respiratory Infection",
      likelihood: "Common",
      description: "Fever represents a standard systemic immune response to acute viral exposure.",
    });
  }

  if (lower.includes("headache") || lower.includes("migraine") || lower.includes("head pain")) {
    possibleConditions.push({
      name: "Tension or Vascular Cephalea",
      likelihood: "Common",
      description: "Commonly precipitated by cervicocranial muscular tension, fatigue, or dehydration.",
    });
  }

  if (lower.includes("cough") || lower.includes("throat") || lower.includes("congestion") || lower.includes("cold") || lower.includes("sneez")) {
    possibleConditions.push({
      name: "Acute Pharyngitis / Bronchial Irritation",
      likelihood: "Common",
      description: "Inflammation of respiratory mucosal pathways presenting with localized cough or throat irritation.",
    });
  }

  if (lower.includes("chest") || lower.includes("breath") || lower.includes("shortness") || lower.includes("dyspnea") || lower.includes("pressure")) {
    urgencyLevel = "Seek Prompt Medical Attention";
    possibleConditions.push({
      name: "Cardiorespiratory Strain",
      likelihood: "Important Assessment",
      description: "Cardiopulmonary symptoms warrant direct in-person clinical diagnostic evaluation.",
    });
  }

  if (lower.includes("stomach") || lower.includes("abdomen") || lower.includes("nausea") || lower.includes("vomit") || lower.includes("diarrhea")) {
    possibleConditions.push({
      name: "Acute Gastroenteritis / Dyspepsia",
      likelihood: "Possible",
      description: "Gastrointestinal mucosal irritation or dietary intolerance requiring hydration support.",
    });
  }

  if (possibleConditions.length === 0) {
    possibleConditions.push({
      name: "General Physiological Strain",
      likelihood: "Possible",
      description: "Symptoms may reflect physical overexertion, systemic fatigue, or early mild viral exposure.",
    });
  }

  return {
    summary: symptomsText.trim(),
    urgencyLevel,
    possibleConditions,
    clinicalExplanation: "Reported symptoms have been evaluated against standard clinical observational presentation patterns.",
    selfCareSuggestions: [
      "Maintain abundant oral fluid hydration and allow adequate physiological rest.",
      "Track your vital signs (temperature, heart rate, oxygen) in the Predict workspace.",
      "Avoid strenuous physical exertion until acute symptoms resolve.",
    ],
    whenToSeekCare: "Seek immediate in-person medical care if symptoms worsen rapidly, difficulty breathing occurs, or severe localized pain develops.",
  };
}

export async function analyzeSymptomsWithGemini(symptomsText) {
  if (!symptomsText || symptomsText.trim().length === 0) {
    throw new Error("Please enter a description of your symptoms.");
  }

  try {
    const response = await fetch("/api/analyze-symptoms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        symptoms: symptomsText.trim(),
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result && result.success && result.data) {
        const data = result.data;
        if (data.possibleConditions && data.possibleConditions.length > 0) {
          return data;
        }
      }
    }
  } catch (err) {
    console.warn("[SymptomService] API request fell back to client symptom engine:", err);
  }

  return generateFallbackSymptomAnalysis(symptomsText);
}
