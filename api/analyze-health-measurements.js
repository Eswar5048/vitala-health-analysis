// Clinical Rule-Based Physiological Evaluation Engine with Partial Field Support
function evaluateClinicalMeasurements(rawMeasurements = {}) {
  const defaultVals = {
    age: 35, heartRate: 72, systolicBP: 120, diastolicBP: 80,
    bodyTemp: 98.6, spO2: 98, respiratoryRate: 16, bloodGlucose: 95, thyroid: 1.8
  };

  const has = (key) => rawMeasurements[key] !== undefined && rawMeasurements[key] !== null && String(rawMeasurements[key]).trim() !== "";

  const age = has('age') ? parseFloat(rawMeasurements.age) : defaultVals.age;
  const hr = has('heartRate') ? parseFloat(rawMeasurements.heartRate) : defaultVals.heartRate;
  const sbp = has('systolicBP') ? parseFloat(rawMeasurements.systolicBP) : defaultVals.systolicBP;
  const dbp = has('diastolicBP') ? parseFloat(rawMeasurements.diastolicBP) : defaultVals.diastolicBP;
  const temp = has('bodyTemp') ? parseFloat(rawMeasurements.bodyTemp) : defaultVals.bodyTemp;
  const spo2 = has('spO2') ? parseFloat(rawMeasurements.spO2) : defaultVals.spO2;
  const rr = has('respiratoryRate') ? parseFloat(rawMeasurements.respiratoryRate) : defaultVals.respiratoryRate;
  const glu = has('bloodGlucose') ? parseFloat(rawMeasurements.bloodGlucose) : defaultVals.bloodGlucose;
  const tsh = has('thyroid') ? parseFloat(rawMeasurements.thyroid) : defaultVals.thyroid;

  let penalty = 0;
  let hasEmergency = false;
  const detectedConcerns = [];

  // Heart Rate
  if (has('heartRate')) {
    if (hr < 45 || hr > 140) {
      hasEmergency = true;
      penalty += 30;
      detectedConcerns.push({
        parameter: "Heart Rate",
        issue: hr > 140 ? "Severe Tachycardia" : "Severe Bradycardia",
        value: `${hr} BPM`,
        severity: "critical",
        note: "Resting heart rate significantly deviates from normal range (60-100 BPM)."
      });
    } else if (hr < 60 || hr > 100) {
      penalty += 12;
      detectedConcerns.push({
        parameter: "Heart Rate",
        issue: hr > 100 ? "Elevated Heart Rate" : "Low Heart Rate",
        value: `${hr} BPM`,
        severity: "concerning",
        note: "Resting pulse is slightly outside optimal baseline (60-100 BPM)."
      });
    }
  }

  // Blood Pressure
  if (has('systolicBP') || has('diastolicBP')) {
    if (sbp >= 180 || dbp >= 120 || sbp < 75 || dbp < 50) {
      hasEmergency = true;
      penalty += 35;
      detectedConcerns.push({
        parameter: "Blood Pressure",
        issue: (sbp >= 180 || dbp >= 120) ? "Hypertensive Crisis Range" : "Severe Hypotension",
        value: `${sbp}/${dbp} mmHg`,
        severity: "critical",
        note: "Blood pressure reading is significantly outside safe operating thresholds."
      });
    } else if (sbp > 130 || dbp > 85 || sbp < 90 || dbp < 60) {
      penalty += 14;
      detectedConcerns.push({
        parameter: "Blood Pressure",
        issue: (sbp > 130 || dbp > 85) ? "Elevated Blood Pressure" : "Low Blood Pressure",
        value: `${sbp}/${dbp} mmHg`,
        severity: "concerning",
        note: "Measurements indicate pre-hypertensive or mildly hypotensive deviation."
      });
    }
  }

  // SpO2
  if (has('spO2')) {
    if (spo2 < 90) {
      hasEmergency = true;
      penalty += 35;
      detectedConcerns.push({
        parameter: "Oxygen Saturation (SpO₂)",
        issue: "Critical Hypoxemia",
        value: `${spo2}%`,
        severity: "critical",
        note: "Blood oxygen saturation is below safe clinical threshold (<90%)."
      });
    } else if (spo2 < 95) {
      penalty += 15;
      detectedConcerns.push({
        parameter: "Oxygen Saturation (SpO₂)",
        issue: "Reduced Blood Oxygen",
        value: `${spo2}%`,
        severity: "concerning",
        note: "Oxygen saturation is slightly below optimal baseline (95-100%)."
      });
    }
  }

  // Body Temperature in Fahrenheit (°F)
  if (has('bodyTemp')) {
    if (temp >= 103.0 || temp <= 94.0) {
      hasEmergency = true;
      penalty += 25;
      detectedConcerns.push({
        parameter: "Body Temperature",
        issue: temp >= 103.0 ? "High Fever (Severe Pyrexia)" : "Severe Hypothermia",
        value: `${temp}°F`,
        severity: "critical",
        note: "Body temperature exhibits significant thermoregulatory deviation."
      });
    } else if (temp > 99.5 || temp < 96.5) {
      penalty += 10;
      detectedConcerns.push({
        parameter: "Body Temperature",
        issue: temp > 99.5 ? "Elevated Temperature (Low Fever)" : "Subnormal Temperature",
        value: `${temp}°F`,
        severity: "concerning",
        note: "Temperature deviates from normal baseline (97.0°F - 99.0°F)."
      });
    }
  }

  // Respiratory Rate
  if (has('respiratoryRate')) {
    if (rr > 30 || rr < 8) {
      hasEmergency = true;
      penalty += 25;
      detectedConcerns.push({
        parameter: "Respiratory Rate",
        issue: rr > 30 ? "Severe Tachypnea" : "Severe Bradypnea",
        value: `${rr} br/min`,
        severity: "critical",
        note: "Breathing rate deviates markedly from physiological norms (12-20 br/min)."
      });
    } else if (rr > 20 || rr < 12) {
      penalty += 8;
      detectedConcerns.push({
        parameter: "Respiratory Rate",
        issue: rr > 20 ? "Elevated Breathing Rate" : "Depressed Breathing Rate",
        value: `${rr} br/min`,
        severity: "concerning",
        note: "Ventilatory rate is slightly outside normal range (12-20 breaths/min)."
      });
    }
  }

  // Blood Glucose
  if (has('bloodGlucose')) {
    if (glu >= 250 || glu < 50) {
      hasEmergency = true;
      penalty += 25;
      detectedConcerns.push({
        parameter: "Blood Glucose",
        issue: glu >= 250 ? "Severe Hyperglycemia" : "Severe Hypoglycemia",
        value: `${glu} mg/dL`,
        severity: "critical",
        note: "Blood sugar reading presents acute metabolic risk."
      });
    } else if (glu > 140 || glu < 70) {
      penalty += 10;
      detectedConcerns.push({
        parameter: "Blood Glucose",
        issue: glu > 140 ? "Elevated Blood Sugar" : "Low Blood Sugar",
        value: `${glu} mg/dL`,
        severity: "concerning",
        note: "Glucose is outside optimal fasting baseline (70-125 mg/dL)."
      });
    }
  }

  // Thyroid (TSH)
  if (has('thyroid')) {
    if (tsh >= 10.0 || tsh < 0.1) {
      penalty += 15;
      detectedConcerns.push({
        parameter: "Thyroid (TSH)",
        issue: tsh >= 10.0 ? "Marked Hypothyroidism Indicator" : "Marked Hyperthyroidism Indicator",
        value: `${tsh} µIU/mL`,
        severity: "concerning",
        note: "TSH level indicates endocrine hormone imbalance (Normal: 0.4-4.0 µIU/mL)."
      });
    } else if (tsh > 4.5 || tsh < 0.3) {
      penalty += 6;
      detectedConcerns.push({
        parameter: "Thyroid (TSH)",
        issue: tsh > 4.5 ? "Slightly Elevated TSH" : "Slightly Suppressed TSH",
        value: `${tsh} µIU/mL`,
        severity: "concerning",
        note: "TSH is outside standard reference bracket (0.4-4.0 µIU/mL)."
      });
    }
  }

  const healthRate = Math.max(15, Math.min(100, Math.round(100 - penalty)));
  let riskLevel = "LOW / NORMAL";
  let riskColor = "#16A34A";
  let warningMessage = null;

  if (hasEmergency || penalty >= 45 || healthRate < 55) {
    riskLevel = "EMERGENCY / NEED MEDICAL ATTENTION";
    riskColor = "#B91C1C";
    warningMessage = "Critical physiological measurements detected. In-person medical evaluation is urgently recommended.";
  } else if (penalty >= 25 || healthRate < 70) {
    riskLevel = "RISK";
    riskColor = "#DC2626";
    warningMessage = "Notable physiological deviations detected. A medical consultation is recommended.";
  } else if (penalty > 0 || healthRate < 88) {
    riskLevel = "SEMI-RISK";
    riskColor = "#D97706";
    warningMessage = "Some measurements are outside standard reference ranges. Monitoring is recommended.";
  }

  const parameterResults = [
    { key: "age", status: "Normal", severity: "normal", value: age },
    { key: "heartRate", status: !has('heartRate') ? "Not Provided" : (hr < 45 || hr > 140) ? "Outside expected range" : (hr < 60 || hr > 100) ? "Concerning" : "Normal", severity: (hr < 45 || hr > 140) ? "critical" : (hr < 60 || hr > 100) ? "concerning" : "normal", value: hr },
    { key: "systolicBP", status: !has('systolicBP') ? "Not Provided" : (sbp >= 180 || sbp < 75) ? "Outside expected range" : (sbp > 130 || sbp < 90) ? "Concerning" : "Normal", severity: (sbp >= 180 || sbp < 75) ? "critical" : (sbp > 130 || sbp < 90) ? "concerning" : "normal", value: sbp },
    { key: "diastolicBP", status: !has('diastolicBP') ? "Not Provided" : (dbp >= 120 || dbp < 50) ? "Outside expected range" : (dbp > 85 || dbp < 60) ? "Concerning" : "Normal", severity: (dbp >= 120 || dbp < 50) ? "critical" : (dbp > 85 || dbp < 60) ? "concerning" : "normal", value: dbp },
    { key: "bodyTemp", status: !has('bodyTemp') ? "Not Provided" : (temp >= 103.0 || temp <= 94.0) ? "Outside expected range" : (temp > 99.5 || temp < 96.5) ? "Concerning" : "Normal", severity: (temp >= 103.0 || temp <= 94.0) ? "critical" : (temp > 99.5 || temp < 96.5) ? "concerning" : "normal", value: temp },
    { key: "spO2", status: !has('spO2') ? "Not Provided" : (spo2 < 90) ? "Outside expected range" : (spo2 < 95) ? "Concerning" : "Normal", severity: (spo2 < 90) ? "critical" : (spo2 < 95) ? "concerning" : "normal", value: spo2 },
    { key: "respiratoryRate", status: !has('respiratoryRate') ? "Not Provided" : (rr > 30 || rr < 8) ? "Outside expected range" : (rr > 20 || rr < 12) ? "Concerning" : "Normal", severity: (rr > 30 || rr < 8) ? "critical" : (rr > 20 || rr < 12) ? "concerning" : "normal", value: rr },
    { key: "bloodGlucose", status: !has('bloodGlucose') ? "Not Provided" : (glu >= 250 || glu < 50) ? "Outside expected range" : (glu > 140 || glu < 70) ? "Concerning" : "Normal", severity: (glu >= 250 || glu < 50) ? "critical" : (glu > 140 || glu < 70) ? "concerning" : "normal", value: glu },
    { key: "thyroid", status: !has('thyroid') ? "Not Provided" : (tsh >= 10.0 || tsh < 0.1) ? "Outside expected range" : (tsh > 4.5 || tsh < 0.3) ? "Concerning" : "Normal", severity: (tsh >= 10.0 || tsh < 0.1) ? "concerning" : (tsh > 4.5 || tsh < 0.3) ? "concerning" : "normal", value: tsh }
  ];

  let summaryExplanation = "All provided health parameters reside within standard expected reference ranges.";
  if (detectedConcerns.length > 0) {
    const names = detectedConcerns.map(c => c.parameter).join(", ");
    summaryExplanation = `Assessment identified variations in: ${names}. These contributed to the risk rating.`;
  }

  return {
    healthRate,
    riskLevel,
    riskColor,
    summaryExplanation,
    warningMessage,
    detectedConcerns,
    parameterResults,
    parsedValues: {
      age, heartRate: hr, systolicBP: sbp, diastolicBP: dbp,
      bodyTemp: temp, spO2: spo2, respiratoryRate: rr, bloodGlucose: glu, thyroid: tsh
    },
    recommendations: [
      "Maintain consistent hydration and balanced diet.",
      "Track vitals regularly for continuous baseline monitoring."
    ]
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
  const measurements = body?.measurements || {};
  
  const healthApiKey =
    process.env.GEMINI_HEALTH_API_KEY ||
    process.env.GEMINI_JULI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    '';

  try {
    let assessmentData = null;

    if (healthApiKey && healthApiKey.trim().length > 0) {
      const prompt = `You are the clinical physiological assessment engine for Vital.
Analyze the provided patient health measurements (Body Temperature is in Fahrenheit °F).
Note: Some parameters may be omitted if the user does not have specific measuring devices. Evaluate what is provided.
Submitted measurements:
${JSON.stringify(measurements, null, 2)}

STRICT REQUIREMENTS:
1. "riskLevel" MUST BE EXACTLY ONE OF: "LOW / NORMAL", "SEMI-RISK", "RISK", "EMERGENCY / NEED MEDICAL ATTENTION"
2. "riskColor" MUST MATCH: "LOW / NORMAL" -> "#16A34A", "SEMI-RISK" -> "#D97706", "RISK" -> "#DC2626", "EMERGENCY / NEED MEDICAL ATTENTION" -> "#B91C1C"
3. "healthRate" MUST be an integer between 15 and 100 representing health index.
4. "parameterResults" MUST assess all 9 parameters ("age", "heartRate", "systolicBP", "diastolicBP", "bodyTemp", "spO2", "respiratoryRate", "bloodGlucose", "thyroid").
5. "parsedValues" MUST contain all 9 numerical parameter values for charts (fill unprovided parameters with standard normal values: age 35, hr 72, sbp 120, dbp 80, temp 98.6, spo2 98, rr 16, glu 95, tsh 1.8).

OUTPUT MUST BE VALID JSON MATCHING THIS EXACT SCHEMA:
{
  "healthRate": 85,
  "riskLevel": "LOW / NORMAL",
  "riskColor": "#16A34A",
  "summaryExplanation": "Short clinical summary of provided vitals",
  "warningMessage": null,
  "detectedConcerns": [],
  "parameterResults": [
    { "key": "age", "status": "Normal", "severity": "normal", "value": 35 },
    { "key": "heartRate", "status": "Normal", "severity": "normal", "value": 72 },
    { "key": "systolicBP", "status": "Normal", "severity": "normal", "value": 120 },
    { "key": "diastolicBP", "status": "Normal", "severity": "normal", "value": 80 },
    { "key": "bodyTemp", "status": "Normal", "severity": "normal", "value": 98.6 },
    { "key": "spO2", "status": "Normal", "severity": "normal", "value": 98 },
    { "key": "respiratoryRate", "status": "Normal", "severity": "normal", "value": 16 },
    { "key": "bloodGlucose", "status": "Normal", "severity": "normal", "value": 95 },
    { "key": "thyroid", "status": "Normal", "severity": "normal", "value": 1.8 }
  ],
  "parsedValues": {
    "age": 35, "heartRate": 72, "systolicBP": 120, "diastolicBP": 80,
    "bodyTemp": 98.6, "spO2": 98, "respiratoryRate": 16, "bloodGlucose": 95, "thyroid": 1.8
  },
  "recommendations": [
    "Maintain balanced hydration.",
    "Follow up with regular checks."
  ]
}`;

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${healthApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
          }
        })
      });

      if (geminiResponse.ok) {
        const geminiJson = await geminiResponse.json();
        const rawContent = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawContent) {
          const parsed = JSON.parse(rawContent);
          const validCategories = ["LOW / NORMAL", "SEMI-RISK", "RISK", "EMERGENCY / NEED MEDICAL ATTENTION"];
          if (validCategories.includes(parsed.riskLevel) && parsed.parameterResults) {
            assessmentData = parsed;
          }
        }
      }
    }

    if (!assessmentData) {
      assessmentData = evaluateClinicalMeasurements(measurements);
    }

    return res.status(200).json({ success: true, data: assessmentData });
  } catch (error) {
    const fallback = evaluateClinicalMeasurements(measurements || {});
    return res.status(200).json({ success: true, data: fallback });
  }
}
