// Clinical Rule-Based Symptom Evaluation Engine
function evaluateClinicalSymptoms(symptomsText = '') {
  const lower = (symptomsText || '').toLowerCase();
  const possibleConditions = [];
  let urgencyLevel = "Routine";

  if (lower.includes("fever") || lower.includes("temperature") || lower.includes("chills") || lower.includes("sweat")) {
    possibleConditions.push({
      name: "Viral Upper Respiratory Infection",
      likelihood: "Common",
      description: "Fever represents a standard systemic immune response to acute viral exposure."
    });
  }

  if (lower.includes("headache") || lower.includes("migraine") || lower.includes("head pain")) {
    possibleConditions.push({
      name: "Tension or Vascular Cephalea",
      likelihood: "Common",
      description: "Commonly precipitated by cervicocranial muscular tension, fatigue, or dehydration."
    });
  }

  if (lower.includes("cough") || lower.includes("throat") || lower.includes("congestion") || lower.includes("cold") || lower.includes("sneez")) {
    possibleConditions.push({
      name: "Acute Pharyngitis / Bronchial Irritation",
      likelihood: "Common",
      description: "Inflammation of respiratory mucosal pathways presenting with localized cough or throat irritation."
    });
  }

  if (lower.includes("chest") || lower.includes("breath") || lower.includes("shortness") || lower.includes("dyspnea") || lower.includes("pressure")) {
    urgencyLevel = "Seek Prompt Medical Attention";
    possibleConditions.push({
      name: "Cardiorespiratory Strain",
      likelihood: "Important Assessment",
      description: "Cardiopulmonary symptoms warrant direct in-person clinical diagnostic evaluation."
    });
  }

  if (lower.includes("stomach") || lower.includes("abdomen") || lower.includes("nausea") || lower.includes("vomit") || lower.includes("diarrhea")) {
    possibleConditions.push({
      name: "Acute Gastroenteritis / Dyspepsia",
      likelihood: "Possible",
      description: "Gastrointestinal mucosal irritation or dietary intolerance requiring hydration support."
    });
  }

  if (possibleConditions.length === 0) {
    possibleConditions.push({
      name: "General Physiological Strain",
      likelihood: "Possible",
      description: "Symptoms may reflect physical overexertion, systemic fatigue, or early mild viral exposure."
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
      "Avoid strenuous physical exertion until acute symptoms resolve."
    ],
    whenToSeekCare: "Seek immediate in-person medical care if symptoms worsen rapidly, difficulty breathing occurs, or severe localized pain develops."
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const symptomsText = (body?.symptoms || '').trim();
  const healthApiKey = process.env.GEMINI_HEALTH_API_KEY;

  if (!symptomsText) {
    return res.status(400).json({ success: false, error: 'Symptoms description is required.' });
  }

  try {
    let analysisData = null;

    if (healthApiKey && healthApiKey.trim().length > 0) {
      const prompt = `You are a clinical educational symptom assessment engine for Vitala.
Analyze the user-reported symptoms for clinical guidance.
CRITICAL INSTRUCTIONS:
- Keep all explanations short, crisp, and direct to the point (no long essay paragraphs).
- Output MUST be valid JSON matching this exact schema:

{
  "summary": "${symptomsText}",
  "urgencyLevel": "Routine / Needs Monitoring / Prompt Medical Attention",
  "possibleConditions": [
    {
      "name": "Condition name",
      "likelihood": "Common / Possible / Less Common",
      "description": "1 short sentence explaining the connection."
    }
  ],
  "clinicalExplanation": "1-2 short, direct sentences explaining the physiological mechanism.",
  "selfCareSuggestions": [
    "Short actionable self-care tip"
  ],
  "whenToSeekCare": "Clear guidance on when in-person medical evaluation is required."
}

User symptoms to evaluate: "${symptomsText}"`;

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${healthApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        })
      });

      if (geminiResponse.ok) {
        const geminiJson = await geminiResponse.json();
        const rawContent = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawContent) {
          const parsed = JSON.parse(rawContent);
          if (parsed.possibleConditions && parsed.selfCareSuggestions) {
            analysisData = parsed;
          }
        }
      }
    }

    if (!analysisData) {
      analysisData = evaluateClinicalSymptoms(symptomsText);
    }

    return res.status(200).json({ success: true, data: analysisData });
  } catch (error) {
    const fallback = evaluateClinicalSymptoms(symptomsText);
    return res.status(200).json({ success: true, data: fallback });
  }
}
