import React, { useState } from "react";
import {
  Stethoscope,
  Send,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  ShieldAlert,
  ListChecks,
  MapPin,
  Clock,
  Activity,
  PlusCircle,
  FileText,
  UserCheck,
} from "lucide-react";
import { analyzeSymptomsWithGemini } from "../services/symptomService";
import { recordUserActivity } from "../services/db";

const COMMON_SYMPTOM_TAGS = [
  "Fever / Chills",
  "Headache",
  "Dry Cough",
  "Sore Throat",
  "Fatigue & Weakness",
  "Body Aches",
  "Nausea / Queasiness",
  "Dizziness",
  "Chest Tightness",
  "Shortness of Breath",
  "Stomach Pain",
  "Nasal Congestion",
];

const DURATION_OPTIONS = [
  "Under 24 hours (Acute onset)",
  "1–3 days",
  "4–7 days (About a week)",
  "1–2 weeks",
  "More than 2 weeks (Persistent)",
];

const SEVERITY_LEVELS = [
  { label: "Mild", desc: "Manageable, minimal disruption", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { label: "Moderate", desc: "Uncomfortable, slowing me down", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { label: "Severe", desc: "Intense, impacting daily tasks", color: "text-rose-700 bg-rose-50 border-rose-200" },
];

export default function SymptomAnalysisWorkspace({ onNavigateToCare, session }) {
  const [symptomsText, setSymptomsText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [duration, setDuration] = useState(DURATION_OPTIONS[1]);
  const [severity, setSeverity] = useState("Mild");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptomsText.trim() && selectedTags.length === 0) {
      setErrorMsg("Please select at least one symptom tag or describe what you are experiencing.");
      return;
    }

    setErrorMsg("");
    setIsProcessing(true);

    try {
      const payload = {
        symptoms: symptomsText.trim(),
        tags: selectedTags,
        duration,
        severity,
        additionalContext: additionalNotes.trim(),
      };

      const data = await analyzeSymptomsWithGemini(payload);
      setAnalysisResult(data);
      recordUserActivity({
        email: session?.email,
        type: "symptom",
        title: `Symptom Check: "${data.summary || symptomsText.slice(0, 40) || selectedTags.join(', ')}"`,
        summary: data.clinicalExplanation,
        riskLevel: data.urgencyLevel || "Routine Care",
        riskColor: data.urgencyColor || (data.urgencyLevel?.toLowerCase().includes("attention") ? "#DC2626" : "#0F766E"),
        data,
      });
    } catch (err) {
      setErrorMsg(err.message || "An error occurred while analyzing symptoms.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSymptomsText("");
    setSelectedTags([]);
    setDuration(DURATION_OPTIONS[1]);
    setSeverity("Mild");
    setAdditionalNotes("");
    setErrorMsg("");
    setAnalysisResult(null);
  };

  return (
    <div className="space-y-6 2xl:space-y-8">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 2xl:p-10 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 text-[#0F766E] text-xs 2xl:text-sm font-bold font-mono uppercase mb-3 border border-teal-100">
          <Stethoscope className="w-4 h-4" />
          <span>Clinical Observation Intake</span>
        </div>
        <h1 className="font-brand text-2xl sm:text-3xl 2xl:text-4xl font-bold text-[#0F2747] tracking-tight">
          Symptom Analysis
        </h1>
        <p className="text-sm sm:text-base 2xl:text-lg text-slate-500 mt-1.5 max-w-3xl leading-relaxed">
          For users who do not have clinical measuring devices and want to describe their symptoms for structured health evaluation.
        </p>
      </div>

      {/* Main Content: Form View OR Result View */}
      {analysisResult ? (
        /* RESULT VIEW */
        <div className="space-y-6 2xl:space-y-8 animate-fadeIn">
          {/* Return / Reset Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setAnalysisResult(null)}
              className="inline-flex items-center gap-2 px-4 py-2.5 2xl:px-5 2xl:py-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm 2xl:text-base font-semibold text-[#0F2747] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Modify Description</span>
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

          {/* Assessment Summary Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 2xl:p-10 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 2xl:pb-5 border-b border-slate-100 mb-5">
              <div>
                <span className="text-xs 2xl:text-sm font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Symptom Assessment Overview
                </span>
                <h2 className="text-base sm:text-lg 2xl:text-xl font-bold text-[#0F2747] mt-0.5">
                  Reported: "{analysisResult.summary}"
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {analysisResult.urgencyLevel && (
                  <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs 2xl:text-sm font-bold font-mono ${
                    analysisResult.urgencyLevel.toLowerCase().includes("attention") || analysisResult.urgencyLevel.toLowerCase().includes("emergency")
                      ? "bg-rose-50 text-rose-800 border-rose-200"
                      : analysisResult.urgencyLevel.toLowerCase().includes("monitoring")
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-teal-50 text-[#0F766E] border-teal-200"
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                    <span>{analysisResult.urgencyLevel}</span>
                  </div>
                )}
                {analysisResult.recommendedSpecialist && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs 2xl:text-sm font-semibold">
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>{analysisResult.recommendedSpecialist}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm sm:text-base 2xl:text-lg text-[#1E293B] leading-relaxed font-medium">
              {analysisResult.clinicalExplanation}
            </p>
          </div>

          {/* Possible Associated Conditions */}
          {analysisResult.possibleConditions && analysisResult.possibleConditions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 2xl:p-10 shadow-xs">
              <h3 className="text-sm sm:text-base 2xl:text-lg font-bold text-[#0F2747] uppercase tracking-wide font-mono pb-3.5 border-b border-slate-100 mb-5 flex items-center gap-2">
                <ListChecks className="w-4 h-4 2xl:w-5 2xl:h-5 text-[#0F766E]" />
                <span>Possible Associated Health Conditions</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 2xl:gap-6">
                {analysisResult.possibleConditions.map((cond, idx) => (
                  <div
                    key={idx}
                    className="p-5 2xl:p-6 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-sm sm:text-base 2xl:text-lg text-[#0F2747]">
                          {cond.name}
                        </h4>
                        {cond.likelihood && (
                          <span className="text-[10px] 2xl:text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-[#0F766E] border border-teal-200/60 flex-shrink-0">
                            {cond.likelihood}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm 2xl:text-base text-slate-600 leading-relaxed">
                        {cond.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supportive Care Guidance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 2xl:gap-8">
            {/* Self-Care Advice */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 2xl:p-10 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm sm:text-base 2xl:text-lg font-bold text-[#0F2747] uppercase tracking-wide font-mono pb-3.5 border-b border-slate-100 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 2xl:w-5 2xl:h-5 text-emerald-600" />
                  <span>Supportive Self-Care Measures</span>
                </h3>

                <ul className="space-y-3 2xl:space-y-4">
                  {analysisResult.selfCareSuggestions && analysisResult.selfCareSuggestions.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm 2xl:text-base text-slate-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* When to Seek Care & Direct Nearby Care Action */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 2xl:p-10 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm sm:text-base 2xl:text-lg font-bold text-[#0F2747] uppercase tracking-wide font-mono pb-3.5 border-b border-slate-100 mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 2xl:w-5 2xl:h-5 text-rose-600" />
                  <span>When to Seek Clinical Care</span>
                </h3>

                <p className="text-xs sm:text-sm 2xl:text-base text-slate-600 leading-relaxed">
                  {analysisResult.whenToSeekCare ||
                    "If symptoms worsen rapidly, persist beyond standard recovery periods, or severe pain / breathing difficulty develops, seek immediate in-person medical evaluation."}
                </p>

                {onNavigateToCare && (
                  <button
                    type="button"
                    onClick={onNavigateToCare}
                    className="mt-5 px-5 py-3 bg-[#0F2747] hover:bg-[#0A1B33] text-white text-xs 2xl:text-sm font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer shadow-xs w-full sm:w-auto justify-center"
                  >
                    <MapPin className="w-4 h-4 text-teal-400" />
                    <span>Find Open Hospitals & Doctors Near You</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Medical Safety Disclaimer */}
          <div className="p-4 2xl:p-5 bg-slate-50 border border-slate-200/70 rounded-2xl text-center text-xs 2xl:text-sm text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-700 mb-0.5">
              Medical Research Disclaimer
            </p>
            <p className="max-w-4xl mx-auto">
              This symptom assessment is generated for educational and research purposes only. It is not a clinical medical diagnosis. Always consult a qualified healthcare provider regarding symptoms or treatment.
            </p>
          </div>
        </div>
      ) : (
        /* FORM VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 2xl:p-10 shadow-xs">
          <div className="flex items-center justify-between pb-4 2xl:pb-5 border-b border-slate-100 mb-6 2xl:mb-8">
            <h2 className="text-sm sm:text-base 2xl:text-lg font-bold text-[#0F2747] uppercase tracking-wide font-mono flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Describe Your Health Symptoms</span>
            </h2>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm 2xl:text-base text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 2xl:space-y-8">
            {/* Quick Symptom Tags */}
            <div>
              <label className="block text-xs sm:text-sm 2xl:text-base font-semibold text-[#1E293B] mb-2 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-teal-600" />
                <span>Common Symptoms (Click to select)</span>
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {COMMON_SYMPTOM_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-[#0F766E] text-white border-[#0F766E] shadow-2xs scale-102"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs sm:text-sm 2xl:text-base font-semibold text-[#1E293B] mb-2">
                Detailed Description / How you feel
              </label>
              <textarea
                rows={4}
                value={symptomsText}
                onChange={(e) => {
                  setSymptomsText(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="Describe what you are experiencing..."
                className={`w-full p-4 2xl:p-5 bg-slate-50/60 rounded-xl border text-sm sm:text-base 2xl:text-lg text-[#1E293B] focus:bg-white focus:ring-2 focus:ring-teal-50 outline-none transition-all resize-y font-medium ${
                  errorMsg
                    ? "border-red-500 focus:border-red-500"
                    : "border-slate-300 focus:border-[#0F766E]"
                }`}
              />
              {errorMsg && (
                <span className="text-xs 2xl:text-sm text-red-600 mt-1.5 block font-medium">
                  {errorMsg}
                </span>
              )}
            </div>

            {/* Duration and Severity Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#1E293B] mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Duration</span>
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-3 bg-slate-50/60 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-50 outline-none"
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#1E293B] mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  <span>Severity Level</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SEVERITY_LEVELS.map((lvl) => {
                    const active = severity === lvl.label;
                    return (
                      <button
                        key={lvl.label}
                        type="button"
                        onClick={() => setSeverity(lvl.label)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          active
                            ? `${lvl.color} font-bold shadow-2xs ring-2 ring-teal-500/20`
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <div className="text-xs font-semibold">{lvl.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Additional Medical Notes (Optional) */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#1E293B] mb-1.5">
                Existing Conditions / Medical Notes (Optional)
              </label>
              <input
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Enter any existing medical conditions or notes (optional)..."
                className="w-full p-3 bg-slate-50/60 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-50 outline-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-4 2xl:pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs 2xl:text-sm text-slate-400">
                Observational patterns evaluate respiratory, systemic, and metabolic symptoms.
              </span>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full sm:w-auto px-8 py-3.5 2xl:px-10 2xl:py-4 bg-[#0F2747] hover:bg-[#0A1B33] active:bg-[#071324] text-white font-semibold rounded-xl text-sm sm:text-base 2xl:text-lg transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E] disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    <span>Analyzing Symptoms...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Analyze Symptoms</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
