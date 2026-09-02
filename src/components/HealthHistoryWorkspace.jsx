import React, { useState, useEffect } from "react";
import {
  History,
  Activity,
  Stethoscope,
  MapPin,
  Calendar,
  Clock,
  Trash2,
  Download,
  Search,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertTriangle,
} from "lucide-react";
import {
  getUserHistory,
  deleteHistoryItem,
  clearUserHistory,
} from "../services/db";

export default function HealthHistoryWorkspace({ session }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'predict' | 'symptom' | 'care'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState(null); // Item to inspect
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Load history from db
  const loadHistory = () => {
    const items = getUserHistory(session?.email, activeFilter);
    setHistoryItems(items);
  };

  useEffect(() => {
    loadHistory();
  }, [session, activeFilter]);

  // Handle single item deletion
  const handleDeleteItem = (e, itemId) => {
    e.stopPropagation();
    deleteHistoryItem(session?.email, itemId);
    loadHistory();
  };

  // Handle clear all history
  const handleClearAll = () => {
    clearUserHistory(session?.email);
    setHistoryItems([]);
    setShowClearConfirm(false);
    setSelectedReport(null);
  };

  // Handle export history
  const handleExportHistory = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(historyItems, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vital_health_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter items by search query
  const filteredItems = historyItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.summary?.toLowerCase().includes(q) ||
      item.riskLevel?.toLowerCase().includes(q) ||
      item.formattedDate?.toLowerCase().includes(q)
    );
  });

  // Calculate Overview Stats
  const totalCount = historyItems.length;
  const predictItems = historyItems.filter((i) => i.type === "predict");
  const symptomItems = historyItems.filter((i) => i.type === "symptom");
  const careItems = historyItems.filter((i) => i.type === "care");

  const avgScore =
    predictItems.length > 0
      ? Math.round(
          predictItems.reduce((acc, curr) => acc + (curr.score || 0), 0) /
            predictItems.length
        )
      : "--";

  const lastActivity = historyItems[0]
    ? `${historyItems[0].formattedDate} at ${historyItems[0].formattedTime}`
    : "No activity yet";

  return (
    <div className="space-y-6 2xl:space-y-8 animate-fadeIn">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 2xl:p-10 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 text-[#0F766E] text-xs 2xl:text-sm font-bold font-mono uppercase mb-3 border border-teal-100">
              <History className="w-4 h-4" />
              <span>User Activity Archive</span>
            </div>
            <h1 className="font-brand text-2xl sm:text-3xl 2xl:text-4xl font-bold text-[#0F2747] tracking-tight">
              Health History
            </h1>
            <p className="text-sm sm:text-base 2xl:text-lg text-slate-500 mt-1.5 max-w-3xl leading-relaxed">
              Review and inspect your previous health assessments, symptom evaluations, and medical lookups recorded in your profile.
            </p>
          </div>

          {/* Action Buttons */}
          {historyItems.length > 0 && (
            <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={handleExportHistory}
                className="px-4 py-2.5 2xl:px-5 2xl:py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#0F2747] text-xs 2xl:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
                title="Export History Report as JSON"
              >
                <Download className="w-3.5 h-3.5 text-teal-600" />
                <span>Export Report</span>
              </button>

              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="px-4 py-2.5 2xl:px-5 2xl:py-3 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs 2xl:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                title="Clear All History"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overview Statistics Grid (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 2xl:gap-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 2xl:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs 2xl:text-sm font-bold uppercase font-mono">Total Activities</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl 2xl:text-4xl font-black text-[#0F2747] font-brand">
            {totalCount}
          </div>
          <span className="text-[11px] 2xl:text-xs text-slate-400 mt-1 font-mono">
            Recorded in session
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 2xl:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs 2xl:text-sm font-bold uppercase font-mono">Predict Runs</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl 2xl:text-4xl font-black text-[#0F2747] font-brand">
            {predictItems.length}{" "}
            <span className="text-xs sm:text-sm font-normal text-slate-400 font-sans">
              (Avg: {avgScore})
            </span>
          </div>
          <span className="text-[11px] 2xl:text-xs text-slate-400 mt-1 font-mono">
            Average Health Score
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 2xl:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs 2xl:text-sm font-bold uppercase font-mono">Symptom Checks</span>
            <Stethoscope className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="text-2xl sm:text-3xl 2xl:text-4xl font-black text-[#0F2747] font-brand">
            {symptomItems.length}
          </div>
          <span className="text-[11px] 2xl:text-xs text-slate-400 mt-1 font-mono">
            Analyzed queries
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 2xl:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs 2xl:text-sm font-bold uppercase font-mono">Last Activity</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-sm sm:text-base 2xl:text-lg font-bold text-[#0F2747] truncate">
            {lastActivity}
          </div>
          <span className="text-[11px] 2xl:text-xs text-slate-400 mt-1 font-mono">
            Timestamp
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 2xl:p-6 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Activity" },
            { id: "predict", label: "Predict Evaluations" },
            { id: "symptom", label: "Symptom Checks" },
            { id: "care", label: "Care Lookups" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-2 2xl:px-4 2xl:py-2.5 rounded-xl text-xs 2xl:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                activeFilter === tab.id
                  ? "bg-[#0F2747] text-white border-[#0F2747] shadow-xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past history..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#0F766E] focus:bg-white text-xs 2xl:text-sm outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* History Items Timeline / Cards */}
      {filteredItems.length > 0 ? (
        <div className="space-y-4 2xl:space-y-5">
          {filteredItems.map((item) => {
            const isPredict = item.type === "predict";
            const isSymptom = item.type === "symptom";
            const isCare = item.type === "care";

            return (
              <div
                key={item.id}
                onClick={() => setSelectedReport(item)}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 2xl:p-8 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left Side: Badge, Date, Title, Summary */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Feature Type Badge */}
                    <span
                      className={`text-[10px] 2xl:text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                        isPredict
                          ? "bg-teal-50 text-[#0F766E] border-teal-200/80"
                          : isSymptom
                          ? "bg-sky-50 text-sky-800 border-sky-200"
                          : "bg-indigo-50 text-indigo-800 border-indigo-200"
                      }`}
                    >
                      {isPredict && <Activity className="w-3 h-3" />}
                      {isSymptom && <Stethoscope className="w-3 h-3" />}
                      {isCare && <MapPin className="w-3 h-3" />}
                      <span>{isPredict ? "Predict Evaluation" : isSymptom ? "Symptom Assessment" : "Care Lookup"}</span>
                    </span>

                    {/* Date & Time */}
                    <span className="text-xs 2xl:text-sm text-slate-400 font-mono flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.formattedDate}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.formattedTime}</span>
                    </span>

                    {/* Score or Risk Level Badge */}
                    {item.score !== null && (
                      <span
                        className="text-xs 2xl:text-sm font-bold font-mono px-2.5 py-0.5 rounded-md border"
                        style={{
                          backgroundColor: `${item.riskColor}15`,
                          borderColor: `${item.riskColor}40`,
                          color: item.riskColor || "#0F766E",
                        }}
                      >
                        Score: {item.score}/100 • {item.riskLevel}
                      </span>
                    )}

                    {item.riskLevel && !item.score && (
                      <span className="text-xs 2xl:text-sm font-bold font-mono px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {item.riskLevel}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base 2xl:text-lg font-bold text-[#0F2747] group-hover:text-[#0F766E] transition-colors truncate">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm 2xl:text-base text-slate-500 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>

                  {/* Parameter chips preview for Predict */}
                  {isPredict && item.data?.parsedValues && (
                    <div className="flex items-center gap-2 pt-1 flex-wrap font-mono text-[11px] 2xl:text-xs text-slate-500">
                      <span className="px-2 py-0.5 bg-slate-50 rounded border border-slate-200/80">
                        HR: {item.data.parsedValues.heartRate} BPM
                      </span>
                      <span className="px-2 py-0.5 bg-slate-50 rounded border border-slate-200/80">
                        BP: {item.data.parsedValues.systolicBP}/{item.data.parsedValues.diastolicBP}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-50 rounded border border-slate-200/80">
                        Temp: {item.data.parsedValues.bodyTemp}°F
                      </span>
                      <span className="px-2 py-0.5 bg-slate-50 rounded border border-slate-200/80">
                        SpO₂: {item.data.parsedValues.spO2}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Side: Inspect Action & Delete */}
                <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(item)}
                    className="px-4 py-2 2xl:px-5 2xl:py-2.5 bg-slate-50 group-hover:bg-[#0F2747] text-[#0F2747] group-hover:text-white rounded-xl text-xs 2xl:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 group-hover:border-[#0F2747]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteItem(e, item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-[#0F2747] text-base 2xl:text-lg">
            No Past Activity Found
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Activities you perform—such as running health parameter predictions, symptom assessments, or hospital lookups—will appear here automatically.
          </p>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#0F2747]">Clear Activity History?</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                This will permanently remove all past prediction evaluations and symptom checks for your account. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold cursor-pointer shadow-xs"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Past Report Inspection Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fadeIn my-auto">
            {/* Modal Header */}
            <div className="p-6 bg-[#0F2747] text-white flex items-center justify-between flex-shrink-0">
              <div>
                <span className="text-xs font-mono text-teal-300 uppercase tracking-wider block mb-1">
                  Past Health Report Archive
                </span>
                <h2 className="text-base sm:text-lg 2xl:text-xl font-bold font-brand">
                  {selectedReport.title}
                </h2>
                <div className="text-xs text-slate-300 font-mono mt-1 flex items-center gap-2">
                  <span>{selectedReport.formattedDate}</span>
                  <span>•</span>
                  <span>{selectedReport.formattedTime}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm 2xl:text-base leading-relaxed">
              {/* Summary Block */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-400 uppercase font-mono block mb-1">
                  Clinical Summary
                </span>
                <p className="text-slate-800 font-medium">{selectedReport.summary}</p>
              </div>

              {/* Predict Report Inspection View */}
              {selectedReport.type === "predict" && selectedReport.data && (
                <div className="space-y-6">
                  {/* Health Rate & Risk Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <span className="text-xs font-bold text-slate-400 uppercase font-mono block">
                        Health Rate Score
                      </span>
                      <div className="text-3xl font-black text-[#0F2747] font-brand mt-1">
                        {selectedReport.data.healthRate}{" "}
                        <span className="text-sm font-normal text-slate-400">/ 100</span>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <span className="text-xs font-bold text-slate-400 uppercase font-mono block">
                        Risk Level Classification
                      </span>
                      <div
                        className="text-lg font-bold font-mono mt-1.5"
                        style={{ color: selectedReport.data.riskColor || "#0F766E" }}
                      >
                        {selectedReport.data.riskLevel}
                      </div>
                    </div>
                  </div>

                  {/* 9 Parameters Breakdown */}
                  {selectedReport.data.parsedValues && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-[#0F2747] uppercase font-mono">
                        Evaluated Health Parameters
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 font-mono">
                          <span className="text-slate-400 text-xs block">Heart Rate</span>
                          <span className="font-bold text-slate-800">{selectedReport.data.parsedValues.heartRate} BPM</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 font-mono">
                          <span className="text-slate-400 text-xs block">Blood Pressure</span>
                          <span className="font-bold text-slate-800">{selectedReport.data.parsedValues.systolicBP} / {selectedReport.data.parsedValues.diastolicBP} mmHg</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 font-mono">
                          <span className="text-slate-400 text-xs block">Body Temp</span>
                          <span className="font-bold text-slate-800">{selectedReport.data.parsedValues.bodyTemp} °F</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 font-mono">
                          <span className="text-slate-400 text-xs block">SpO₂</span>
                          <span className="font-bold text-slate-800">{selectedReport.data.parsedValues.spO2} %</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 font-mono">
                          <span className="text-slate-400 text-xs block">Respiratory Rate</span>
                          <span className="font-bold text-slate-800">{selectedReport.data.parsedValues.respiratoryRate} br/min</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 font-mono">
                          <span className="text-slate-400 text-xs block">Blood Glucose</span>
                          <span className="font-bold text-slate-800">{selectedReport.data.parsedValues.bloodGlucose} mg/dL</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detected Concerns */}
                  {selectedReport.data.detectedConcerns && selectedReport.data.detectedConcerns.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-[#0F2747] uppercase font-mono">
                        Detected Health Concerns
                      </h4>
                      <div className="space-y-2">
                        {selectedReport.data.detectedConcerns.map((c, idx) => (
                          <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm">
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-amber-900">{c.parameter} - {c.issue}:</strong>{" "}
                              <span className="text-amber-800">{c.note}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Symptom Assessment Inspection View */}
              {selectedReport.type === "symptom" && selectedReport.data && (
                <div className="space-y-5">
                  {selectedReport.data.possibleConditions && (
                    <div>
                      <h4 className="font-bold text-sm text-[#0F2747] uppercase font-mono mb-3">
                        Possible Associated Conditions
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedReport.data.possibleConditions.map((cond, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-[#0F2747]">{cond.name}</span>
                              <span className="text-xs px-2 py-0.5 bg-teal-50 text-[#0F766E] rounded font-mono">
                                {cond.likelihood}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">{cond.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedReport.data.selfCareSuggestions && (
                    <div>
                      <h4 className="font-bold text-sm text-[#0F2747] uppercase font-mono mb-2">
                        Supportive Self-Care Advice
                      </h4>
                      <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm text-slate-600">
                        {selectedReport.data.selfCareSuggestions.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2.5 bg-[#0F2747] hover:bg-[#0A1B33] text-white text-xs sm:text-sm font-semibold rounded-xl cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
