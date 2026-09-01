export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symptoms, duration, severity, additionalNotes } = req.body || {};
  const healthApiKey = process.env.GEMINI_HEALTH_API_KEY;

  try {
    let resultData;

    if (healthApiKey && healthApiKey.trim().length > 0) {
      const prompt = `You are a clinical diagnostic evaluation assistant for Vitala.
A user reported the following symptoms:
- Primary Symptoms: "${symptoms}"
- Duration: "${duration || "Not specified"}"
- Self-Reported Severity: "${severity || "moderate"}"
- Additional Context: "${additionalNotes || "None"}"

Respond ONLY with raw valid JSON:
{
  "urgencyLevel": "Moderate",
  "urgencyColor": "#D97706",
  "summary": "Clinical evaluation summary of reported symptoms.",
  "possibleCauses": [
    { "name": "Primary Consideration", "description": "Clinical explanation of likely etiology." }
  ],
  "selfCareSteps": [
    "Rest and maintain adequate fluid intake.",
    "Monitor for progressive symptoms."
  ],
  "redFlagWarnings": [
    "Seek immediate medical attention if severe shortness of breath or persistent chest pressure develops."
  ],
  "recommendedSpecialist": "Primary Care Physician / General Practitioner"
}`;

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
          resultData = JSON.parse(rawContent);
        }
      }
    }

    if (!resultData) {
      resultData = {
        urgencyLevel: severity === "severe" ? "Urgent / Consult Doctor" : "Moderate",
        urgencyColor: severity === "severe" ? "#DC2626" : "#D97706",
        summary: `Evaluation for symptoms: ${symptoms}. Consider rest and monitoring vital signs.`,
        possibleCauses: [
          { name: "Symptom Cluster Analysis", description: "General physiological stress response or acute viral etiology." }
        ],
        selfCareSteps: [
          "Ensure generous oral fluid hydration and adequate sleep.",
          "Keep logging vital signs in the Predict workspace."
        ],
        redFlagWarnings: [
          "If pain escalates or breathing becomes difficult, seek immediate care."
        ],
        recommendedSpecialist: "General Practitioner / Internal Medicine"
      };
    }

    return res.status(200).json({ success: true, data: resultData });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
