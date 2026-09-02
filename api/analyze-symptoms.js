// Enhanced Clinical Rule-Based Symptom Evaluation Engine
function evaluateClinicalSymptoms({ symptoms = '', duration = '', severity = '', tags = [], additionalContext = '' }) {
  const combinedText = [symptoms, ...(tags || []), duration, severity, additionalContext].filter(Boolean).join(' ').toLowerCase();
  const possibleConditions = [];
  let urgencyLevel = "Routine Care";
  let urgencyColor = "#0F766E";
  let recommendedSpecialist = "General Physician / Family Medicine";

  const isSevere = severity.toLowerCase().includes("severe") || combinedText.includes("severe") || combinedText.includes("unbearable");
  const isLongDuration = duration.toLowerCase().includes("week") || duration.toLowerCase().includes("month");

  if (combinedText.includes("chest") || combinedText.includes("breath") || combinedText.includes("shortness") || combinedText.includes("dyspnea") || combinedText.includes("pressure") || combinedText.includes("tightness")) {
    urgencyLevel = "Seek Prompt Medical Attention";
    urgencyColor = "#DC2626";
    recommendedSpecialist = "Cardiologist / Emergency Medicine";
    possibleConditions.push({
      name: "Cardiorespiratory Strain",
      likelihood: "Important Assessment",
      description: "Thoracic discomfort and breathing difficulty warrant direct in-person clinical diagnostic evaluation."
    });
  }

  if (combinedText.includes("fever") || combinedText.includes("temperature") || combinedText.includes("chills") || combinedText.includes("sweat")) {
    if (urgencyLevel !== "Seek Prompt Medical Attention" && isSevere) {
      urgencyLevel = "Needs Monitoring";
      urgencyColor = "#D97706";
    }
    possibleConditions.push({
      name: "Acute Viral Upper Respiratory Infection",
      likelihood: "Common",
      description: "Fever represents a standard systemic immune response to acute viral exposure."
    });
  }

  if (combinedText.includes("cough") || combinedText.includes("throat") || combinedText.includes("congestion") || combinedText.includes("cold") || combinedText.includes("sneez") || combinedText.includes("runny")) {
    if (!recommendedSpecialist.includes("Cardiologist")) recommendedSpecialist = "General Physician / ENT Specialist";
    possibleConditions.push({
      name: "Acute Pharyngitis / Bronchial Irritation",
      likelihood: "Common",
      description: "Inflammation of respiratory mucosal pathways presenting with localized cough or throat irritation."
    });
  }

  if (combinedText.includes("headache") || combinedText.includes("migraine") || combinedText.includes("head pain")) {
    if (isSevere && urgencyLevel !== "Seek Prompt Medical Attention") {
      urgencyLevel = "Needs Monitoring";
      urgencyColor = "#D97706";
    }
    possibleConditions.push({
      name: "Tension or Vascular Cephalea",
      likelihood: "Common",
      description: "Commonly precipitated by cervicocranial muscular tension, fatigue, or dehydration."
    });
  }

  if (combinedText.includes("stomach") || combinedText.includes("abdomen") || combinedText.includes("nausea") || combinedText.includes("vomit") || combinedText.includes("diarrhea") || combinedText.includes("acid")) {
    if (!recommendedSpecialist.includes("Cardiologist")) recommendedSpecialist = "Gastroenterologist / General Physician";
    possibleConditions.push({
      name: "Acute Gastroenteritis / Dyspepsia",
      likelihood: "Possible",
      description: "Gastrointestinal mucosal irritation or dietary intolerance requiring hydration support."
    });
  }

  if (combinedText.includes("dizz") || combinedText.includes("vertigo") || combinedText.includes("lighthead")) {
    possibleConditions.push({
      name: "Orthostatic or Vestibular Equilibrium Strain",
      likelihood: "Possible",
      description: "Can occur due to dehydration, inner ear fluid shift, or sudden postural blood pressure changes."
    });
  }

  if (combinedText.includes("fatigue") || combinedText.includes("body ache") || combinedText.includes("tired") || combinedText.includes("weak")) {
    possibleConditions.push({
      name: "Post-Viral Fatigue or Systemic Strain",
      likelihood: "Possible",
      description: "Musculoskeletal soreness and lethargy resulting from immune activation or overexertion."
    });
  }

  if (possibleConditions.length === 0) {
    possibleConditions.push({
      name: "General Physiological Strain",
      likelihood: "Possible",
      description: "Reported symptoms may reflect physical overexertion, systemic fatigue, or early mild viral exposure."
    });
  }

  return {
    summary: symptoms || (tags.length > 0 ? tags.join(", ") : "Reported Symptoms"),
    urgencyLevel,
    urgencyColor,
    recommendedSpecialist,
    possibleConditions,
    clinicalExplanation: `Reported symptoms (${duration ? `duration: ${duration}` : 'recent onset'}, ${severity ? `severity: ${severity}` : 'standard intensity'}) evaluated against standard clinical observational presentation patterns.`,
    selfCareSuggestions: [
      "Maintain abundant oral fluid hydration and allow adequate physiological rest.",
      "Track your vital signs (temperature, heart rate, oxygen) in the Predict workspace.",
      "Avoid strenuous physical exertion and monitor symptom progression over the next 24–48 hours."
    ],
    whenToSeekCare: "Seek immediate in-person medical care if symptoms worsen rapidly, difficulty breathing occurs, chest pressure develops, or severe unyielding pain arises."
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

  const symptoms = (body?.symptoms || '').trim();
  const duration = (body?.duration || '').trim();
  const severity = (body?.severity || '').trim();
  const tags = Array.isArray(body?.tags) ? body.tags : [];
  const additionalContext = (body?.additionalContext || '').trim();

  const fullPromptText = [
    symptoms ? `Description: "${symptoms}"` : '',
    tags.length > 0 ? `Reported Symptoms: ${tags.join(', ')}` : '',
    duration ? `Duration: ${duration}` : '',
    severity ? `Severity: ${severity}` : '',
    additionalContext ? `Additional Medical Context: ${additionalContext}` : ''
  ].filter(Boolean).join('\n');

  if (!symptoms && tags.length === 0) {
    return res.status(400).json({ success: false, error: 'Please enter a symptom description or select at least one symptom tag.' });
  }

  const apiKey =
    process.env.GEMINI_HEALTH_API_KEY ||
    process.env.GEMINI_JULI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    '';

  try {
    let analysisData = null;

    if (apiKey && apiKey.trim().length > 0) {
      const prompt = `You are an educational clinical symptom assessment engine for the Vital platform.
Evaluate the patient's reported symptoms:
${fullPromptText}

STRICT REQUIREMENTS:
1. "urgencyLevel" MUST BE ONE OF: "Routine Care", "Needs Monitoring", "Seek Prompt Medical Attention"
2. "possibleConditions" MUST contain 2-4 possible conditions with name, likelihood ("Common" | "Possible" | "Less Common"), and 1 concise explanatory sentence.
3. "clinicalExplanation" MUST be 1-2 direct sentences explaining the physiological mechanism.
4. "selfCareSuggestions" MUST be 3-4 bulleted actionable tips.
5. "recommendedSpecialist" MUST suggest the appropriate medical specialty (e.g. "General Physician", "ENT Specialist", "Pulmonologist", "Cardiologist").
6. "whenToSeekCare" MUST provide clear clinical red flags.

OUTPUT MUST BE VALID RAW JSON MATCHING THIS EXACT SCHEMA:
{
  "summary": "${symptoms || tags.join(', ')}",
  "urgencyLevel": "Routine Care",
  "recommendedSpecialist": "General Physician / Family Medicine",
  "possibleConditions": [
    {
      "name": "Condition Name",
      "likelihood": "Common",
      "description": "Short explanation of the physiological connection."
    }
  ],
  "clinicalExplanation": "1-2 concise sentences explaining the symptom mechanism.",
  "selfCareSuggestions": [
    "Ensure adequate hydration and physiological rest.",
    "Monitor temperature and oxygen saturation."
  ],
  "whenToSeekCare": "Seek in-person evaluation if severe chest pain, shortness of breath, or high persistent fever develops."
}`;

      const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
      for (const model of modelsToTry) {
        try {
          const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
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
              if (parsed.possibleConditions && parsed.possibleConditions.length > 0) {
                analysisData = parsed;
                break;
              }
            }
          }
        } catch (e) {}
      }
    }

    if (!analysisData) {
      analysisData = evaluateClinicalSymptoms({ symptoms, duration, severity, tags, additionalContext });
    }

    return res.status(200).json({ success: true, data: analysisData });
  } catch (error) {
    const fallback = evaluateClinicalSymptoms({ symptoms, duration, severity, tags, additionalContext });
    return res.status(200).json({ success: true, data: fallback });
  }
}
