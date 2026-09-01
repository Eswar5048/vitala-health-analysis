export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history } = req.body || {};
  const juliApiKey = process.env.GEMINI_JULI_API_KEY;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  try {
    let replyText = '';

    if (juliApiKey && juliApiKey.trim().length > 0) {
      const systemInstruction = `You are Juli, an ultra-concise clinical physiological health assistant for the Vitala platform.

CORE PRINCIPLE:
Give only the direct main matter immediately. Maximum 35 words total.
Use 1 or 2 bullet points if helpful.
Zero fluff, zero preamble, zero conversational disclaimers.`;

      const contents = [];
      if (history && Array.isArray(history)) {
        history.slice(-4).forEach(item => {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.content }]
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
      replyText = `Vital physiological metrics (Heart Rate 60–100 BPM, BP 120/80 mmHg, Temp 97.0–99.0°F) provide objective clinical baselines. What specific parameter would you like to evaluate?`;
    }

    return res.status(200).json({ success: true, reply: replyText });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
