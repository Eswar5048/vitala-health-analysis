/**
 * Vital Health Prediction & Risk Assessment Engine
 * Modular clinical logic with Flexible Partial Measurement Support.
 * Uses Fahrenheit (°F) for Body Temperature.
 */

export const PARAMETER_DEFINITIONS = {
  age: {
    label: "Age",
    unit: "years",
    minValid: 1,
    maxValid: 120,
    normalMin: 18,
    normalMax: 65,
    defaultVal: 35,
  },
  heartRate: {
    label: "Heart Rate",
    unit: "BPM",
    minValid: 30,
    maxValid: 240,
    normalMin: 60,
    normalMax: 100,
    concerningLow: 50,
    concerningHigh: 110,
    defaultVal: 72,
  },
  systolicBP: {
    label: "Systolic Blood Pressure",
    unit: "mmHg",
    minValid: 60,
    maxValid: 260,
    normalMin: 90,
    normalMax: 120,
    concerningLow: 85,
    concerningHigh: 140,
    defaultVal: 120,
  },
  diastolicBP: {
    label: "Diastolic Blood Pressure",
    unit: "mmHg",
    minValid: 40,
    maxValid: 160,
    normalMin: 60,
    normalMax: 80,
    concerningLow: 55,
    concerningHigh: 90,
    defaultVal: 80,
  },
  bodyTemp: {
    label: "Body Temperature",
    unit: "°F",
    minValid: 88.0,
    maxValid: 112.0,
    normalMin: 97.0,
    normalMax: 99.0,
    concerningLow: 96.0,
    concerningHigh: 100.4,
    defaultVal: 98.6,
  },
  spO2: {
    label: "Oxygen Saturation (SpO₂)",
    unit: "%",
    minValid: 50,
    maxValid: 100,
    normalMin: 95,
    normalMax: 100,
    concerningLow: 90,
    concerningHigh: 100,
    defaultVal: 98,
  },
  respiratoryRate: {
    label: "Respiratory Rate",
    unit: "breaths/min",
    minValid: 6,
    maxValid: 60,
    normalMin: 12,
    normalMax: 20,
    concerningLow: 10,
    concerningHigh: 24,
    defaultVal: 16,
  },
  bloodGlucose: {
    label: "Blood Sugar / Glucose",
    unit: "mg/dL",
    minValid: 30,
    maxValid: 600,
    normalMin: 70,
    normalMax: 125,
    concerningLow: 60,
    concerningHigh: 180,
    defaultVal: 95,
  },
  thyroid: {
    label: "Thyroid (TSH)",
    unit: "µIU/mL",
    minValid: 0.05,
    maxValid: 50.0,
    normalMin: 0.4,
    normalMax: 4.0,
    concerningLow: 0.2,
    concerningHigh: 6.5,
    defaultVal: 1.8,
  },
};

/**
 * Validate input parameters — Allows partial fields!
 * Only throws error if value is invalid format or if zero measurements provided.
 */
export function validateMeasurements(inputs = {}) {
  const errors = {};
  const parsed = {};
  const provided = {};
  let providedCount = 0;

  for (const [key, def] of Object.entries(PARAMETER_DEFINITIONS)) {
    const rawVal = inputs[key];
    if (rawVal === undefined || rawVal === null || String(rawVal).trim() === "") {
      // Not provided - use standard baseline fallback
      parsed[key] = def.defaultVal;
      provided[key] = false;
      continue;
    }

    const num = parseFloat(rawVal);
    if (isNaN(num)) {
      errors[key] = `Please enter a valid numerical value for ${def.label}.`;
      continue;
    }

    if (num < def.minValid || num > def.maxValid) {
      errors[key] = `${def.label} must be between ${def.minValid} and ${def.maxValid} ${def.unit}.`;
      continue;
    }

    parsed[key] = num;
    provided[key] = true;
    providedCount++;
  }

  if (providedCount === 0 && Object.keys(errors).length === 0) {
    errors.general = "Please enter at least one health measurement to evaluate.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    parsedValues: parsed,
    providedMap: provided,
    providedCount,
  };
}

/**
 * Evaluate health parameters in Fahrenheit and compute score, risk level, and concerns
 */
export function evaluateHealthMeasurements(rawInputs = {}) {
  const { isValid, errors, parsedValues, providedMap } = validateMeasurements(rawInputs);
  if (!isValid) {
    throw new Error(Object.values(errors)[0] || "Invalid input data.");
  }

  const parameterResults = [];
  const detectedConcerns = [];
  let penaltyPoints = 0;
  let hasEmergency = false;

  // 1. Heart Rate Evaluation
  const hr = parsedValues.heartRate;
  if (providedMap.heartRate) {
    if (hr < 45 || hr > 140) {
      hasEmergency = true;
      penaltyPoints += 30;
      detectedConcerns.push({
        parameter: "Heart Rate",
        issue: hr < 45 ? "Critical Bradycardia" : "Severe Tachycardia",
        value: `${hr} BPM`,
        severity: "critical",
        note: "Extreme deviation in resting cardiac rhythm.",
      });
      parameterResults.push({ key: "heartRate", status: "Outside expected range", severity: "critical", value: hr, isProvided: true });
    } else if (hr < 60 || hr > 100) {
      penaltyPoints += 12;
      detectedConcerns.push({
        parameter: "Heart Rate",
        issue: hr < 60 ? "Mild Bradycardia" : "Elevated Heart Rate",
        value: `${hr} BPM`,
        severity: "concerning",
        note: "Heart rate is outside standard resting range (60-100 BPM).",
      });
      parameterResults.push({ key: "heartRate", status: "Concerning", severity: "concerning", value: hr, isProvided: true });
    } else {
      parameterResults.push({ key: "heartRate", status: "Normal", severity: "normal", value: hr, isProvided: true });
    }
  } else {
    parameterResults.push({ key: "heartRate", status: "Not Provided", severity: "normal", value: hr, isProvided: false });
  }

  // 2. Blood Pressure Evaluation (Systolic & Diastolic)
  const sbp = parsedValues.systolicBP;
  const dbp = parsedValues.diastolicBP;
  if (providedMap.systolicBP || providedMap.diastolicBP) {
    if (sbp >= 180 || dbp >= 120 || sbp < 75 || dbp < 50) {
      hasEmergency = true;
      penaltyPoints += 35;
      detectedConcerns.push({
        parameter: "Blood Pressure",
        issue: (sbp >= 180 || dbp >= 120) ? "Hypertensive Crisis Range" : "Severe Hypotension",
        value: `${sbp}/${dbp} mmHg`,
        severity: "critical",
        note: "Blood pressure reading is significantly outside safe operating thresholds.",
      });
      parameterResults.push({ key: "systolicBP", status: "Outside expected range", severity: "critical", value: sbp, isProvided: true });
      parameterResults.push({ key: "diastolicBP", status: "Outside expected range", severity: "critical", value: dbp, isProvided: true });
    } else if (sbp > 130 || dbp > 85 || sbp < 90 || dbp < 60) {
      penaltyPoints += 14;
      detectedConcerns.push({
        parameter: "Blood Pressure",
        issue: (sbp > 130 || dbp > 85) ? "Elevated Blood Pressure" : "Low Blood Pressure",
        value: `${sbp}/${dbp} mmHg`,
        severity: "concerning",
        note: "Measurements indicate pre-hypertensive or mildly hypotensive deviation.",
      });
      parameterResults.push({ key: "systolicBP", status: sbp > 130 || sbp < 90 ? "Concerning" : "Normal", severity: "concerning", value: sbp, isProvided: true });
      parameterResults.push({ key: "diastolicBP", status: dbp > 85 || dbp < 60 ? "Concerning" : "Normal", severity: "concerning", value: dbp, isProvided: true });
    } else {
      parameterResults.push({ key: "systolicBP", status: "Normal", severity: "normal", value: sbp, isProvided: true });
      parameterResults.push({ key: "diastolicBP", status: "Normal", severity: "normal", value: dbp, isProvided: true });
    }
  } else {
    parameterResults.push({ key: "systolicBP", status: "Not Provided", severity: "normal", value: sbp, isProvided: false });
    parameterResults.push({ key: "diastolicBP", status: "Not Provided", severity: "normal", value: dbp, isProvided: false });
  }

  // 3. SpO2 Oxygen Saturation
  const spo2 = parsedValues.spO2;
  if (providedMap.spO2) {
    if (spo2 < 90) {
      hasEmergency = true;
      penaltyPoints += 35;
      detectedConcerns.push({
        parameter: "Oxygen Saturation (SpO₂)",
        issue: "Critical Hypoxemia",
        value: `${spo2}%`,
        severity: "critical",
        note: "Oxygen levels are below safe threshold (<90%).",
      });
      parameterResults.push({ key: "spO2", status: "Outside expected range", severity: "critical", value: spo2, isProvided: true });
    } else if (spo2 < 95) {
      penaltyPoints += 15;
      detectedConcerns.push({
        parameter: "Oxygen Saturation (SpO₂)",
        issue: "Reduced Blood Oxygen",
        value: `${spo2}%`,
        severity: "concerning",
        note: "Oxygen saturation is slightly below optimal baseline (95-100%).",
      });
      parameterResults.push({ key: "spO2", status: "Concerning", severity: "concerning", value: spo2, isProvided: true });
    } else {
      parameterResults.push({ key: "spO2", status: "Normal", severity: "normal", value: spo2, isProvided: true });
    }
  } else {
    parameterResults.push({ key: "spO2", status: "Not Provided", severity: "normal", value: spo2, isProvided: false });
  }

  // 4. Body Temperature in Fahrenheit (°F)
  const temp = parsedValues.bodyTemp;
  if (providedMap.bodyTemp) {
    if (temp >= 103.0 || temp <= 94.0) {
      hasEmergency = true;
      penaltyPoints += 25;
      detectedConcerns.push({
        parameter: "Body Temperature",
        issue: temp >= 103.0 ? "High Fever (Severe Pyrexia)" : "Severe Hypothermia",
        value: `${temp}°F`,
        severity: "critical",
        note: "Body temperature exhibits significant thermoregulatory deviation.",
      });
      parameterResults.push({ key: "bodyTemp", status: "Outside expected range", severity: "critical", value: temp, isProvided: true });
    } else if (temp > 99.5 || temp < 96.5) {
      penaltyPoints += 10;
      detectedConcerns.push({
        parameter: "Body Temperature",
        issue: temp > 99.5 ? "Elevated Temperature (Low Fever)" : "Subnormal Temperature",
        value: `${temp}°F`,
        severity: "concerning",
        note: "Temperature deviates from normal baseline (97.0°F - 99.0°F).",
      });
      parameterResults.push({ key: "bodyTemp", status: "Concerning", severity: "concerning", value: temp, isProvided: true });
    } else {
      parameterResults.push({ key: "bodyTemp", status: "Normal", severity: "normal", value: temp, isProvided: true });
    }
  } else {
    parameterResults.push({ key: "bodyTemp", status: "Not Provided", severity: "normal", value: temp, isProvided: false });
  }

  // 5. Respiratory Rate
  const rr = parsedValues.respiratoryRate;
  if (providedMap.respiratoryRate) {
    if (rr > 30 || rr < 8) {
      hasEmergency = true;
      penaltyPoints += 25;
      detectedConcerns.push({
        parameter: "Respiratory Rate",
        issue: rr > 30 ? "Severe Tachypnea" : "Severe Bradypnea",
        value: `${rr} breaths/min`,
        severity: "critical",
        note: "Breathing rate deviates markedly from physiological norms.",
      });
      parameterResults.push({ key: "respiratoryRate", status: "Outside expected range", severity: "critical", value: rr, isProvided: true });
    } else if (rr > 20 || rr < 12) {
      penaltyPoints += 8;
      detectedConcerns.push({
        parameter: "Respiratory Rate",
        issue: rr > 20 ? "Elevated Breathing Rate" : "Depressed Breathing Rate",
        value: `${rr} breaths/min`,
        severity: "concerning",
        note: "Ventilatory rate is slightly outside normal range (12-20 breaths/min).",
      });
      parameterResults.push({ key: "respiratoryRate", status: "Concerning", severity: "concerning", value: rr, isProvided: true });
    } else {
      parameterResults.push({ key: "respiratoryRate", status: "Normal", severity: "normal", value: rr, isProvided: true });
    }
  } else {
    parameterResults.push({ key: "respiratoryRate", status: "Not Provided", severity: "normal", value: rr, isProvided: false });
  }

  // 6. Blood Glucose
  const glu = parsedValues.bloodGlucose;
  if (providedMap.bloodGlucose) {
    if (glu >= 250 || glu < 50) {
      hasEmergency = true;
      penaltyPoints += 30;
      detectedConcerns.push({
        parameter: "Blood Glucose",
        issue: glu >= 250 ? "Severe Hyperglycemia" : "Acute Hypoglycemia",
        value: `${glu} mg/dL`,
        severity: "critical",
        note: "Glucose level requires immediate nutritional or medical attention.",
      });
      parameterResults.push({ key: "bloodGlucose", status: "Outside expected range", severity: "critical", value: glu, isProvided: true });
    } else if (glu > 140 || glu < 70) {
      penaltyPoints += 10;
      detectedConcerns.push({
        parameter: "Blood Glucose",
        issue: glu > 140 ? "Elevated Blood Sugar" : "Low Blood Sugar",
        value: `${glu} mg/dL`,
        severity: "concerning",
        note: "Glucose is outside optimal fasting baseline (70-125 mg/dL).",
      });
      parameterResults.push({ key: "bloodGlucose", status: "Concerning", severity: "concerning", value: glu, isProvided: true });
    } else {
      parameterResults.push({ key: "bloodGlucose", status: "Normal", severity: "normal", value: glu, isProvided: true });
    }
  } else {
    parameterResults.push({ key: "bloodGlucose", status: "Not Provided", severity: "normal", value: glu, isProvided: false });
  }

  // 7. Thyroid (TSH)
  const tsh = parsedValues.thyroid;
  if (providedMap.thyroid) {
    if (tsh >= 10.0 || tsh < 0.1) {
      penaltyPoints += 15;
      detectedConcerns.push({
        parameter: "Thyroid (TSH)",
        issue: tsh >= 10.0 ? "Marked Hypothyroidism Indicator" : "Marked Hyperthyroidism Indicator",
        value: `${tsh} µIU/mL`,
        severity: "concerning",
        note: "TSH level indicates endocrine hormone imbalance (Normal: 0.4-4.0 µIU/mL).",
      });
      parameterResults.push({ key: "thyroid", status: "Outside expected range", severity: "concerning", value: tsh, isProvided: true });
    } else if (tsh > 4.5 || tsh < 0.3) {
      penaltyPoints += 6;
      detectedConcerns.push({
        parameter: "Thyroid (TSH)",
        issue: tsh > 4.5 ? "Slightly Elevated TSH" : "Slightly Suppressed TSH",
        value: `${tsh} µIU/mL`,
        severity: "concerning",
        note: "TSH is outside standard reference bracket (0.4-4.0 µIU/mL).",
      });
      parameterResults.push({ key: "thyroid", status: "Concerning", severity: "concerning", value: tsh, isProvided: true });
    } else {
      parameterResults.push({ key: "thyroid", status: "Normal", severity: "normal", value: tsh, isProvided: true });
    }
  } else {
    parameterResults.push({ key: "thyroid", status: "Not Provided", severity: "normal", value: tsh, isProvided: false });
  }

  // Age is informational
  parameterResults.unshift({ key: "age", status: "Normal", severity: "normal", value: parsedValues.age, isProvided: !!providedMap.age });

  const healthRate = Math.max(15, Math.min(100, Math.round(100 - penaltyPoints)));
  let riskLevel = "LOW / NORMAL";
  let riskColor = "#16A34A";
  let warningMessage = null;

  if (hasEmergency || penaltyPoints >= 45 || healthRate < 55) {
    riskLevel = "EMERGENCY / NEED MEDICAL ATTENTION";
    riskColor = "#B91C1C";
    warningMessage = "Critical physiological measurements detected. In-person medical evaluation is urgently recommended.";
  } else if (penaltyPoints >= 25 || healthRate < 70) {
    riskLevel = "RISK";
    riskColor = "#DC2626";
    warningMessage = "Notable physiological deviations detected. A medical consultation is recommended.";
  } else if (penaltyPoints > 0 || healthRate < 88) {
    riskLevel = "SEMI-RISK";
    riskColor = "#D97706";
    warningMessage = "Some measurements are outside standard reference ranges. Monitoring is recommended.";
  }

  let summaryExplanation = "All evaluated health parameters reside within standard expected reference ranges.";
  if (detectedConcerns.length > 0) {
    const names = detectedConcerns.map((c) => c.parameter).join(", ");
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
    parsedValues,
    recommendations: [
      "Maintain consistent daily hydration and balanced nutrition.",
      "Monitor resting vitals regularly for continuous baseline tracking.",
    ],
  };
}
