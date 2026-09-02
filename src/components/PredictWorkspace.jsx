import React, { useState } from "react";
import {
  Activity,
  Heart,
  Gauge,
  Thermometer,
  Droplets,
  Wind,
  Zap,
  User,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Radio,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import { submitHealthMeasurements } from "../services/predictService";
import {
  validateMeasurements,
  evaluateHealthMeasurements,
} from "../services/predictEngine";
import { recordUserActivity } from "../services/db";
import HealthMeasurementChart from "./HealthMeasurementChart";

export default function PredictWorkspace({ onNavigateToCare, session }) {
  const [inputMode, setInputMode] = useState("manual"); // 'manual' | 'telemetry'
  const [formData, setFormData] = useState({
    age: "",
    heartRate: "",
    systolicBP: "",
    diastolicBP: "",
    bodyTemp: "",
    spO2: "",
    respiratoryRate: "",
    bloodGlucose: "",
    thyroid: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field] || formErrors.general) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        delete updated.general;
        return updated;
      });
    }
  };

  const handleReset = () => {
    setFormData({
      age: "",
      heartRate: "",
      systolicBP: "",
      diastolicBP: "",
      bodyTemp: "",
      spO2: "",
      respiratoryRate: "",
      bloodGlucose: "",
      thyroid: "",
    });
    setFormErrors({});
    setEvaluationResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateMeasurements(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    setIsAnalyzing(true);

    try {
      const result = await submitHealthMeasurements(formData);
      setEvaluationResult(result);
      recordUserActivity({
        email: session?.email,
        type: "predict",
        title: `Health Predict Evaluation: ${result.healthRate} / 100`,
        summary: result.summaryExplanation,
        score: result.healthRate,
        riskLevel: result.riskLevel,
        riskColor: result.riskColor,
        data: result,
      });
    } catch (err) {
      console.warn("Backend predict call fallback:", err);
      const localResult = evaluateHealthMeasurements(formData);
      setEvaluationResult(localResult);
      recordUserActivity({
        email: session?.email,
        type: "predict",
        title: `Health Predict Evaluation: ${localResult.healthRate} / 100`,
        summary: localResult.summaryExplanation,
        score: localResult.healthRate,
        riskLevel: localResult.riskLevel,
        riskColor: localResult.riskColor,
        data: localResult,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 2xl:space-y-8">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 2xl:p-10 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 text-[#0F766E] text-xs 2xl:text-sm font-bold font-mono uppercase mb-3 border border-teal-100">
              <Activity className="w-4 h-4" />
              <span>Primary Health Feature</span>
            </div>
            <h1 className="font-brand text-2xl sm:text-3xl 2xl:text-4xl font-bold text-[#0F2747] tracking-tight">
              Predict
            </h1>
            <p className="text-sm sm:text-base 2xl:text-lg text-slate-500 mt-1.5 max-w-3xl leading-relaxed">
              Enter your health measurements to analyze physiological indicators and compute your overall health index.
            </p>
          </div>

          {/* Mode Switcher */}
          {!evaluationResult && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setInputMode("manual")}
                className={`px-4 py-2 2xl:px-5 2xl:py-2.5 rounded-lg text-xs sm:text-sm 2xl:text-base font-medium transition-all cursor-pointer ${
                  inputMode === "manual"
                    ? "bg-white text-[#0F2747] shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Manual Input
              </button>
              <button
                type="button"
                onClick={() => setInputMode("telemetry")}
                className={`px-4 py-2 2xl:px-5 2xl:py-2.5 rounded-lg text-xs sm:text-sm 2xl:text-base font-medium transition-all cursor-pointer flex items-center gap-2 ${
                  inputMode === "telemetry"
                    ? "bg-white text-[#0F2747] shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Device Telemetry</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Form View OR Result View */}
      {evaluationResult ? (
        /* RESULT VIEW */
        <div className="space-y-6 2xl:space-y-8 animate-fadeIn">
          {/* Top Return / Recalculate Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setEvaluationResult(null)}
              className="inline-flex items-center gap-2 px-4 py-2.5 2xl:px-5 2xl:py-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm 2xl:text-base font-semibold text-[#0F2747] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Modify Measurements</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm 2xl:text-base text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          </div>

          {/* Primary Assessment Banner: Score + Risk Level */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 2xl:p-10 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 2xl:gap-8 items-center">
              {/* Score Display */}
              <div className="p-6 2xl:p-8 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-center">
                <span className="text-xs 2xl:text-sm font-bold text-slate-400 uppercase tracking-wider font-mono">
                  HEALTH RATE
                </span>
                <div className="text-4xl sm:text-5xl 2xl:text-6xl font-black text-[#0F2747] font-brand mt-1.5 mb-1">
                  {evaluationResult.healthRate}{" "}
                  <span className="text-xl sm:text-2xl 2xl:text-3xl font-semibold text-slate-400 font-sans">
                    / 100
                  </span>
                </div>
                <span className="text-[11px] 2xl:text-xs text-slate-400 font-medium">
                  Health Index Score
                </span>
              </div>

              {/* Overall Status / Risk Level */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs 2xl:text-sm font-bold text-slate-400 uppercase tracking-wider font-mono">
                    OVERALL STATUS
                  </span>
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 2xl:px-5 2xl:py-2.5 rounded-xl border font-bold text-xs sm:text-sm 2xl:text-base tracking-wide font-mono"
                    style={{
                      borderColor: `${evaluationResult.riskColor}40`,
                      backgroundColor: `${evaluationResult.riskColor}12`,
                      color: evaluationResult.riskColor,
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: evaluationResult.riskColor }}
                    ></span>
                    <span>{evaluationResult.riskLevel}</span>
                  </div>
                </div>

                <p className="text-sm sm:text-base 2xl:text-lg text-[#1E293B] leading-relaxed font-medium">
                  {evaluationResult.summaryExplanation}
                </p>

                {/* Notice for Elevated/Emergency Risk */}
                {(evaluationResult.riskLevel === "RISK" ||
                  evaluationResult.riskLevel === "EMERGENCY / NEED MEDICAL ATTENTION" ||
                  evaluationResult.warningMessage) && (
                  <div className="p-4 2xl:p-5 bg-red-50 border border-red-200/80 rounded-xl flex items-start gap-3 mt-3">
                    <ShieldAlert className="w-5 h-5 2xl:w-6 2xl:h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm 2xl:text-base font-bold text-red-900 mb-0.5">
                        Clinical Advisory Notice
                      </h4>
                      <p className="text-xs 2xl:text-sm text-red-700 leading-relaxed">
                        {evaluationResult.warningMessage ||
                          "One or more physiological measurements deviate notably from expected thresholds. A consultation with a qualified medical professional is strongly advised."}
                      </p>
                      {onNavigateToCare && (
                        <button
                          type="button"
                          onClick={onNavigateToCare}
                          className="mt-3 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs 2xl:text-sm font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                        >
                          <span>Find Doctors & Clinics</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Chart Engine */}
          <HealthMeasurementChart evaluationResult={evaluationResult} />

          {/* Detected Concerns Section */}
          {evaluationResult.detectedConcerns && evaluationResult.detectedConcerns.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 2xl:p-10 shadow-xs">
              <h3 className="text-sm sm:text-base 2xl:text-lg font-bold text-[#0F2747] uppercase tracking-wide font-mono pb-3.5 border-b border-slate-100 mb-5 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 2xl:w-5 2xl:h-5 text-amber-600" />
                <span>Detected Physiological Concerns</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 2xl:gap-6">
                {evaluationResult.detectedConcerns.map((concern, idx) => (
                  <div
                    key={idx}
                    className="p-5 2xl:p-6 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono text-xs 2xl:text-sm font-bold text-slate-500 uppercase">
                          {concern.parameter}
                        </span>
                        <span
                          className={`text-[10px] 2xl:text-xs font-mono font-bold px-2 py-0.5 rounded-md uppercase ${
                            concern.severity === "critical"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {concern.severity}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm sm:text-base 2xl:text-lg text-[#0F2747] mb-1">
                        {concern.issue}
                      </h4>
                      <p className="text-xs sm:text-sm 2xl:text-base text-slate-600 leading-relaxed">
                        {concern.note}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-400 font-medium">Recorded Value:</span>
                      <span className="font-mono font-bold text-[#0F2747]">
                        {concern.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* FORM VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 2xl:p-10 shadow-xs">
          {/* Form Header */}
          <div className="flex items-center justify-between pb-4 2xl:pb-5 border-b border-slate-100 mb-6 2xl:mb-8">
            <h2 className="text-sm sm:text-base 2xl:text-lg font-bold text-[#0F2747] uppercase tracking-wide font-mono">
              Health Measurements Intake
            </h2>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm 2xl:text-base text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear All Fields</span>
            </button>
          </div>

          {formErrors.general && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{formErrors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6 2xl:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 2xl:gap-8">
              {/* 1. Age */}
              <div>
                <label className="block text-xs sm:text-sm 2xl:text-base font-semibold text-[#1E293B] mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Age</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => handleFieldChange("age", e.target.value)}
                    className={`w-full pl-4 pr-16 py-3 2xl:py-3.5 bg-slate-50/60 rounded-xl border text-sm sm:text-base text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-teal-50 outline-none transition-all font-medium ${
                      formErrors.age
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-[#0F766E]"
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-400 font-mono font-medium">
                    years
                  </span>
                </div>
                {formErrors.age && (
                  <span className="text-xs text-red-600 mt-1 block font-medium">
                    {formErrors.age}
                  </span>
                )}
              </div>

              {/* 2. Heart Rate */}
              <div>
                <label className="block text-xs sm:text-sm 2xl:text-base font-semibold text-[#1E293B] mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Heart Rate</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="30"
                    max="240"
                    value={formData.heartRate}
                    onChange={(e) => handleFieldChange("heartRate", e.target.value)}
                    className={`w-full pl-4 pr-16 py-3 2xl:py-3.5 bg-slate-50/60 rounded-xl border text-sm sm:text-base text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-teal-50 outline-none transition-all font-medium ${
                      formErrors.heartRate
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-[#0F766E]"
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-400 font-mono font-medium">
                    BPM
                  </span>
                </div>
                {formErrors.heartRate && (
                  <span className="text-xs text-red-600 mt-1 block font-medium">
                    {formErrors.heartRate}
                  </span>
                )}
              </div>

              {/* 3. Systolic BP */}
              <div>
                <label className="block text-xs sm:text-sm 2xl:text-base font-semibold text-[#1E293B] mb-2 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-teal-600" />
                  <span>Systolic Blood Pressure</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="60"
                    max="260"
                    value={formData.systolicBP}
                    onChange={(e) => handleFieldChange("systolicBP", e.target.value)}
                    className={`w-full pl-4 pr-18 py-3 2xl:py-3.5 bg-slate-50/60 rounded-xl border text-sm sm:text-base text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-teal-50 outline-none transition-all font-medium ${
                      formErrors.systolicBP
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-[#0F766E]"
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-400 font-mono font-medium">
                    mmHg
                  </span>
                </div>
                {formErrors.systolicBP && (
                  <span className="text-xs text-red-600 mt-1 block font-medium">
                    {formErrors.systolicBP}
                  </span>
                )}
              </div>

              {/* 4. Diastolic BP */}
              <div>
                <label className="block text-xs sm:text-sm 2xl:text-base font-semibold text-[#1E293B] mb-2 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-teal-600" />
                  <span>Diastolic Blood Pressure</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="40"
                    max="160"
                    value={formData.diastolicBP}
                    onChange={(e) => handleFieldChange("diastolicBP", e.target.value)}
                    className={`w-full pl-4 pr-18 py-3 2xl:py-3.5 bg-slate-50/60 rounded-xl border text-sm sm:text-base text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-teal-50 outline-none transition-all font-medium ${
                      formErrors.diastolicBP
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-[#0F766E]"
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-400 font-mono font-medium">
                    mmHg
                  </span>
                </div>
                {formErrors.diastolicBP && (
                  <span className="text-xs text-red-600 mt-1 block font-medium">
                    {formErrors.diastolicBP}
                  </span>
                )}
              </div>

              {/* 5. Body Temperature in Fahrenheit (°F) */}
              <div>
                <label className="block text-xs sm:text-sm 2xl:text-base font-semibold text-[#1E293B] mb-2 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  <span>Body Temperature</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="88.0"
                    max="112.0"
                    value={formData.bodyTemp}
                    onChange={(e) => handleFieldChange("bodyTemp", e.target.value)}
                    className={`w-full pl-4 pr-14 py-3 2xl:py-3.5 bg-slate-50/60 rounded-xl border text-sm sm:text-base text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-teal-50 outline-none transition-all font-medium ${
                      formErrors.bodyTemp
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-[#0F766E]"
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-400 font-mono font-medium">
                    °F
                  </span>
                </div>
                {formErrors.bodyTemp && (
                  <span className="text-xs text-red-600 mt-1 block font-medium">
                    {formErrors.bodyTemp}
                  </span>
                )}
              </div>

              {/* 6. SpO2 */}
              <div>
                <label className="block text-xs sm:text-sm 2xl:text-base font-semibold text-[#1E293B] mb-2 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>Oxygen Saturation (SpO₂)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={formData.spO2}
                    onChange={(e) => handleFieldChange("spO2", e.target.value)}
                    className={`w-full pl-4 pr-14 py-3 2xl:py-3.5 bg-slate-50/60 rounded-xl border text-sm sm:text-base text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-teal-50 outline-none transition-all font-medium ${
                      formErrors.spO2
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-[#0F766E]"
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-400 font-mono font-medium">
                    %
                  </span>
                </div>
                {formErrors.spO2 && (
                  <span className="text-xs text-red-600 mt-1 block font-medium">
                    {formErrors.spO2}
                  </span>
                )}
              </div>

              {/* 7. Respiratory Rate */}
              <div>
                <label className="block text-xs sm:text-sm 2xl:text-base font-semibold text-[#1E293B] mb-2 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-sky-500" />
                  <span>Respiratory Rate</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="6"
                    max="60"
                    value={formData.respiratoryRate}
                    onChange={(e) => handleFieldChange("respiratoryRate", e.target.value)}
                    className={`w-full pl-4 pr-32 py-3 2xl:py-3.5 bg-slate-50/60 rounded-xl border text-sm sm:text-base text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-teal-50 outline-none transition-all font-medium ${
                      formErrors.respiratoryRate
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-[#0F766E]"
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-400 font-mono font-medium">
                    breaths/min
                  </span>
                </div>
                {formErrors.respiratoryRate && (
                  <span className="text-xs text-red-600 mt-1 block font-medium">
                    {formErrors.respiratoryRate}
                  </span>
                )}
              </div>

              {/* 8. Blood Sugar / Glucose */}
              <div>
                <label className="block text-xs sm:text-sm 2xl:text-base font-semibold text-[#1E293B] mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-500" />
                  <span>Blood Sugar / Glucose</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="30"
                    max="600"
                    value={formData.bloodGlucose}
                    onChange={(e) => handleFieldChange("bloodGlucose", e.target.value)}
                    className={`w-full pl-4 pr-18 py-3 2xl:py-3.5 bg-slate-50/60 rounded-xl border text-sm sm:text-base text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-teal-50 outline-none transition-all font-medium ${
                      formErrors.bloodGlucose
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-[#0F766E]"
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-400 font-mono font-medium">
                    mg/dL
                  </span>
                </div>
                {formErrors.bloodGlucose && (
                  <span className="text-xs text-red-600 mt-1 block font-medium">
                    {formErrors.bloodGlucose}
                  </span>
                )}
              </div>

              {/* 9. Thyroid Value */}
              <div>
                <label className="block text-xs sm:text-sm 2xl:text-base font-semibold text-[#1E293B] mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span>Thyroid Value (TSH)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.05"
                    max="50.0"
                    value={formData.thyroid}
                    onChange={(e) => handleFieldChange("thyroid", e.target.value)}
                    className={`w-full pl-4 pr-20 py-3 2xl:py-3.5 bg-slate-50/60 rounded-xl border text-sm sm:text-base text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-teal-50 outline-none transition-all font-medium ${
                      formErrors.thyroid
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-[#0F766E]"
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-400 font-mono font-medium">
                    µIU/mL
                  </span>
                </div>
                {formErrors.thyroid && (
                  <span className="text-xs text-red-600 mt-1 block font-medium">
                    {formErrors.thyroid}
                  </span>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-5 2xl:pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs 2xl:text-sm text-slate-500 font-medium">
                Entered parameters are evaluated against clinical physiological reference ranges.
              </span>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full sm:w-auto px-8 py-3.5 2xl:px-10 2xl:py-4 bg-[#0F2747] hover:bg-[#0A1B33] active:bg-[#071324] text-white font-semibold rounded-xl text-sm sm:text-base 2xl:text-lg transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E] disabled:opacity-70"
              >
                {isAnalyzing ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    <span>Analyzing Measurements...</span>
                  </>
                ) : (
                  <span>Analyze Health</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
