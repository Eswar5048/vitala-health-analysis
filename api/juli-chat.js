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

  // Cross-fallback key support
  const juliApiKey =
    process.env.GEMINI_JULI_API_KEY ||
    process.env.GEMINI_HEALTH_API_KEY ||
    process.env.GEMINI_API_KEY ||
    '';

  if (!message) {
    return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
  }

  try {
    let replyText = '';

    if (juliApiKey && juliApiKey.trim().length > 0) {
      const systemInstruction = `You are Juli, an ultra-concise clinical physiological health assistant for the Vital platform.

CORE PRINCIPLE:
Give only the direct main matter immediately. Maximum 35 words total.
Use 1 or 2 bullet points if helpful.
Zero fluff, zero preamble, zero conversational disclaimers.`;

      const contents = [];
      if (history && Array.isArray(history)) {
        history.slice(-4).forEach(item => {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.content || item.text || '' }]
          });
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${juliApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: contents,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 120
          }
        })
      });

      if (geminiResponse.ok) {
        const geminiJson = await geminiResponse.json();
        replyText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      }
    }

    if (!replyText) {
      const lower = message.toLowerCase();
      if (lower.includes("spo2") || lower.includes("oxygen")) {
        replyText = "• SpO2: Blood oxygen saturation.\n• Normal Range: 95% – 100% (below 90% is critical).";
      } else if (lower.includes("blood pressure") || lower.includes("bp")) {
        replyText = "• Blood Pressure: Arterial systolic / diastolic pressure.\n• Normal Range: 90–120 / 60–80 mmHg.";
      } else if (lower.includes("heart rate") || lower.includes("bpm") || lower.includes("pulse")) {
        replyText = "• Resting Heart Rate: Normal baseline is 60 – 100 BPM.";
      } else if (lower.includes("glucose") || lower.includes("sugar")) {
        replyText = "• Fasting Glucose: Normal baseline is 70 – 125 mg/dL.";
      } else if (lower.includes("temperature") || lower.includes("temp")) {
        replyText = "• Body Temperature: Normal baseline is 97.0°F – 99.0°F.";
      } else {
        replyText = "• Ask about any vital sign (Heart Rate, BP, SpO2, Temp °F, Glucose) to inspect clinical reference brackets.";
      }
    }

    return res.status(200).json({ success: true, reply: replyText });
  } catch (error) {
    return res.status(200).json({
      success: true,
      reply: "• Vital signs monitoring (Heart Rate, BP, SpO2, Temp 97.0–99.0°F) provides objective health insight. What parameter would you like to check?"
    });
  }
}
