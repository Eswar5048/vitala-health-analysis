// Intelligent Local Health NLP Engine for Juli (Fallback)
function generateIntelligentJuliReply(query = '', history = []) {
  const q = (query || '').toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|good morning|good evening|good afternoon|namaste|hola)\b/i.test(q)) {
    return "Hello! I'm Juli, your Vital health assistant. How can I assist you with your health, vitals, or symptoms today?";
  }

  // Identity / Role
  if (q.includes("who are you") || q.includes("what is your name") || q.includes("what can you do")) {
    return "I am Juli, an AI clinical health companion on Vital. I help explain health measurements, physiological reference ranges, symptom guidance, and lifestyle wellness tips.";
  }

  // Blood Pressure
  if (q.includes("blood pressure") || q.includes("bp") || q.includes("hypertension") || q.includes("hypotension")) {
    if (q.includes("high") || q.includes("lower") || q.includes("reduce") || q.includes("140") || q.includes("150") || q.includes("160")) {
      return "• Blood pressure above 130/80 mmHg indicates elevated or hypertensive range.\n• Immediate steps: Rest quietly, reduce sodium, stay hydrated, and consult a doctor if systolic exceeds 160 mmHg.";
    }
    if (q.includes("low") || q.includes("90") || q.includes("dizzy")) {
      return "• Blood pressure below 90/60 mmHg is hypotensive.\n• Recommendations: Drink water with electrolytes, avoid standing up rapidly, and rest.";
    }
    return "• Normal Blood Pressure: 90–120 mmHg (Systolic) / 60–80 mmHg (Diastolic).\n• Elevated: 120–129 / <80 mmHg.\n• Stage 1 Hypertension: 130–139 / 80–89 mmHg.";
  }

  // SpO2 / Oxygen
  if (q.includes("spo2") || q.includes("oxygen") || q.includes("saturation")) {
    return "• Normal SpO2: 95% – 100% at room air.\n• 90% – 94%: Mildly reduced (needs monitoring).\n• Below 90%: Critical hypoxemia requiring immediate medical oxygen evaluation.";
  }

  // Heart Rate / Pulse
  if (q.includes("heart rate") || q.includes("pulse") || q.includes("bpm") || q.includes("tachycardia") || q.includes("bradycardia")) {
    return "• Normal Resting Heart Rate: 60 – 100 BPM for adults.\n• Bradycardia: Below 60 BPM (athletes may normally be 45-55).\n• Tachycardia: Above 100 BPM at rest.";
  }

  // Temperature / Fever
  if (q.includes("temperature") || q.includes("temp") || q.includes("fever") || q.includes("chills")) {
    return "• Normal Body Temp: 97.0°F – 99.0°F (36.1°C – 37.2°C).\n• Low-grade fever: 99.5°F – 100.4°F.\n• High fever: 102.0°F+ (maintain hydration and consider antipyretics or clinical care if persistent).";
  }

  // Blood Sugar / Glucose / Diabetes
  if (q.includes("glucose") || q.includes("sugar") || q.includes("diabetes") || q.includes("hba1c")) {
    return "• Normal Fasting Glucose: 70 – 99 mg/dL.\n• Pre-diabetes: 100 – 125 mg/dL.\n• Diabetes threshold: Fasting 126 mg/dL or higher.";
  }

  // Headache / Migraine
  if (q.includes("headache") || q.includes("migraine") || q.includes("head pain")) {
    return "• Headache Relief Tips:\n1. Drink 500ml of water (dehydration is a primary cause).\n2. Rest in a dark, quiet room and apply a cool forehead compress.\n3. Avoid screen glare.";
  }

  // Cold / Cough / Sore Throat
  if (q.includes("cough") || q.includes("cold") || q.includes("sore throat") || q.includes("congestion") || q.includes("flu")) {
    return "• Upper Respiratory Support:\n1. Drink warm water with honey and lemon.\n2. Inhale steam or use a humidifier.\n3. Rest and monitor temperature in the Predict tab.";
  }

  // Stomach / Digestion / Nausea
  if (q.includes("stomach") || q.includes("nausea") || q.includes("vomit") || q.includes("acidity") || q.includes("gas") || q.includes("diarrhea")) {
    return "• Digestive Comfort Tips:\n1. Sip oral rehydration fluids or ginger tea.\n2. Follow the BRAT diet (Bananas, Rice, Applesauce, Toast).\n3. Avoid spicy, oily, or caffeinated foods.";
  }

  // Sleep / Insomnia / Fatigue
  if (q.includes("sleep") || q.includes("tired") || q.includes("fatigue") || q.includes("insomnia")) {
    return "• Sleep Optimization:\n1. Aim for 7–9 hours of consistent sleep nightly.\n2. Stop screen usage 45 minutes before bedtime.\n3. Keep room dark and cool (around 65–68°F).";
  }

  // Diet / Water / Nutrition
  if (q.includes("diet") || q.includes("water") || q.includes("food") || q.includes("hydrate") || q.includes("nutrition")) {
    return "• Daily Hydration & Nutrition:\n1. Aim for 2.5 to 3 liters (8-10 glasses) of water daily.\n2. Prioritize whole grains, leafy vegetables, lean proteins, and low glycemic foods.";
  }

  // General Contextual Response
  return `Regarding "${query}": Maintain adequate hydration, monitor your vitals in the Predict tab, and ensure restful sleep. Feel free to ask about specific vitals (BP, SpO2, Heart Rate, Glucose) or symptoms anytime!`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const message = (body?.message || '').trim();
  const history = body?.conversationHistory || body?.history || [];

  const apiKey =
    process.env.GEMINI_JULI_API_KEY ||
    process.env.GEMINI_HEALTH_API_KEY ||
    process.env.GEMINI_API_KEY ||
    '';

  if (!message) {
    return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
  }

  try {
    let replyText = '';

    if (apiKey && apiKey.trim().length > 0) {
      const prompt = `You are Juli, an intelligent, compassionate, concise clinical health assistant on the Vital platform.
INSTRUCTIONS:
1. Directly answer the user's specific health question, greeting, or concern.
2. Keep your answer crisp, informative, and direct (2-4 sentences or clear bullet points).
3. Do NOT just repeat the user's question back to them.
4. Zero generic robotic disclaimers. Give real, helpful medical/wellness guidance.

Conversation Context:
${history.slice(-4).map(h => `${h.role === 'user' ? 'User' : 'Juli'}: ${h.content || h.text || ''}`).join('\n')}

User: ${message}
Juli:`;

      const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
      for (const model of modelsToTry) {
        try {
          const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 250
              }
            })
          });

          if (geminiResponse.ok) {
            const geminiJson = await geminiResponse.json();
            const text = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (text && text.length > 0) {
              replyText = text;
              break;
            }
          }
        } catch (e) {}
      }
    }

    if (!replyText || replyText.trim().length === 0) {
      replyText = generateIntelligentJuliReply(message, history);
    }

    return res.status(200).json({ success: true, reply: replyText });
  } catch (error) {
    const fallback = generateIntelligentJuliReply(message, history);
    return res.status(200).json({ success: true, reply: fallback });
  }
}
