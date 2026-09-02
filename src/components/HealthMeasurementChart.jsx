import React, { useState } from "react";
import { BarChart3, PieChart, Info } from "lucide-react";

export default function HealthMeasurementChart({ evaluationResult }) {
  const [activeMetricKey, setActiveMetricKey] = useState(null);
  const [hoveredSlice, setHoveredSlice] = useState(null); // 'normal' | 'concerning' | 'outside' | null
  const [selectedBar, setSelectedBar] = useState(null);

  if (!evaluationResult || !evaluationResult.parsedValues) {
    return null;
  }

  const { parsedValues, parameterResults } = evaluationResult;

  // 8 Standard Clinical Metrics (Body Temperature in Fahrenheit °F)
  const allChartableMetrics = [
    { key: "heartRate", name: "Heart Rate", shortName: "HR", unit: "BPM", min: 40, max: 140, refMin: 60, refMax: 100 },
    { key: "spO2", name: "SpO₂ Saturation", shortName: "SpO₂", unit: "%", min: 80, max: 100, refMin: 95, refMax: 100 },
    { key: "systolicBP", name: "Systolic BP", shortName: "Sys BP", unit: "mmHg", min: 70, max: 180, refMin: 90, refMax: 120 },
    { key: "diastolicBP", name: "Diastolic BP", shortName: "Dia BP", unit: "mmHg", min: 40, max: 120, refMin: 60, refMax: 80 },
    { key: "bodyTemp", name: "Temperature", shortName: "Temp", unit: "°F", min: 92.0, max: 106.0, refMin: 97.0, refMax: 99.0 },
    { key: "respiratoryRate", name: "Resp. Rate", shortName: "RR", unit: "br/min", min: 8, max: 35, refMin: 12, refMax: 20 },
    { key: "bloodGlucose", name: "Blood Glucose", shortName: "Glucose", unit: "mg/dL", min: 40, max: 250, refMin: 70, refMax: 125 },
    { key: "thyroid", name: "Thyroid (TSH)", shortName: "TSH", unit: "µIU/mL", min: 0.1, max: 8.0, refMin: 0.4, refMax: 4.0 },
  ];

  // Strictly filter to ONLY measurements provided by the user
  const providedParams = (parameterResults || []).filter(
    (p) => p.isProvided !== false && p.status !== "Not Provided" && p.key !== "age"
  );
  const providedKeys = providedParams.map((p) => p.key);

  const chartableMetrics =
    providedKeys.length > 0
      ? allChartableMetrics.filter((m) => providedKeys.includes(m.key))
      : allChartableMetrics;

  // Calculate Status Counts strictly from the provided parameters
  let normalCount = 0;
  let concerningCount = 0;
  let outsideRangeCount = 0;

  const evaluatedParams = providedParams.length > 0 ? providedParams : parameterResults || [];

  evaluatedParams.forEach((param) => {
    if (param.severity === "critical" || param.status === "Outside expected range") {
      outsideRangeCount++;
    } else if (param.severity === "concerning" || param.status === "Concerning") {
      concerningCount++;
    } else if (param.status !== "Not Provided") {
      normalCount++;
    }
  });

  const totalParams = evaluatedParams.length || 1;
  const normalPercent = Math.round((normalCount / totalParams) * 100);
  const concerningPercent = Math.round((concerningCount / totalParams) * 100);
  const outsideRangePercent = Math.round((outsideRangeCount / totalParams) * 100);

  // SVG Pie/Donut calculations (radius = 42, circumference = 2 * PI * 42 ~ 263.89)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  const normalStroke = (normalCount / totalParams) * circumference;
  const concerningStroke = (concerningCount / totalParams) * circumference;
  const outsideStroke = (outsideRangeCount / totalParams) * circumference;

  const normalOffset = 0;
  const concerningOffset = -normalStroke;
  const outsideOffset = -(normalStroke + concerningStroke);

  return (
    <div className="space-y-6 2xl:space-y-8">
      {/* 1. Primary Parameter Range Analysis Tracks (Interactive) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 2xl:p-10 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 2xl:pb-5 border-b border-slate-100 mb-6 2xl:mb-8 gap-2">
          <div>
            <h3 className="text-sm sm:text-base 2xl:text-lg font-bold text-[#0F2747] uppercase tracking-wide font-mono">
              Parameter Range Analysis ({chartableMetrics.length} {chartableMetrics.length === 1 ? 'Metric' : 'Metrics'})
            </h3>
            <p className="text-xs sm:text-sm 2xl:text-base text-slate-500 mt-0.5">
              Visual comparison of your entered measurements against standard clinical reference brackets.
            </p>
          </div>

          {/* Interactive Legend Filters */}
          <div className="flex items-center gap-4 2xl:gap-5 text-xs 2xl:text-sm font-medium flex-wrap">
            <div className="flex items-center gap-1.5 cursor-default">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600">Normal</span>
            </div>
            <div className="flex items-center gap-1.5 cursor-default">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-slate-600">Concerning</span>
            </div>
            <div className="flex items-center gap-1.5 cursor-default">
              <span className="w-3 h-3 rounded-full bg-rose-600"></span>
              <span className="text-slate-600">Outside Range</span>
            </div>
          </div>
        </div>

        {/* Range Tracks List */}
        <div className="space-y-4 2xl:space-y-5">
          {chartableMetrics.map((metric) => {
            const rawVal = parsedValues[metric.key];
            if (rawVal === undefined || rawVal === null) return null;

            const paramResult = parameterResults.find((p) => p.key === metric.key);
            const status = paramResult?.status || "Normal";
            const severity = paramResult?.severity || "normal";

            const isHovered = activeMetricKey === metric.key;

            const rangeSpan = metric.max - metric.min;
            const clampedVal = Math.max(metric.min, Math.min(metric.max, rawVal));
            const valPercent = ((clampedVal - metric.min) / rangeSpan) * 100;

            const refMinPercent = ((metric.refMin - metric.min) / rangeSpan) * 100;
            const refMaxPercent = ((metric.refMax - metric.min) / rangeSpan) * 100;
            const refWidth = refMaxPercent - refMinPercent;

            let indicatorBg = "bg-emerald-500";
            let indicatorGlow = "shadow-[0_0_10px_rgba(16,185,129,0.5)]";
            let badgeText = "text-emerald-700 bg-emerald-50 border-emerald-200";

            if (severity === "critical" || status === "Outside expected range") {
              indicatorBg = "bg-rose-600";
              indicatorGlow = "shadow-[0_0_10px_rgba(220,38,38,0.6)]";
              badgeText = "text-rose-700 bg-rose-50 border-rose-200";
            } else if (severity === "concerning" || status === "Concerning") {
              indicatorBg = "bg-amber-500";
              indicatorGlow = "shadow-[0_0_10px_rgba(217,119,6,0.6)]";
              badgeText = "text-amber-700 bg-amber-50 border-amber-200";
            }

            return (
              <div
                key={metric.key}
                onMouseEnter={() => setActiveMetricKey(metric.key)}
                onMouseLeave={() => setActiveMetricKey(null)}
                className={`p-3 2xl:p-4 rounded-xl transition-all duration-200 cursor-pointer border ${
                  isHovered
                    ? "bg-slate-50/90 border-slate-300 shadow-xs"
                    : "border-transparent hover:border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between text-xs sm:text-sm 2xl:text-base mb-1.5 2xl:mb-2">
                  <div className="flex items-center gap-2 2xl:gap-3">
                    <span className="font-semibold text-[#1E293B]">{metric.name}</span>
                    <span className="text-xs 2xl:text-sm text-slate-400 font-mono">
                      (Target: {metric.refMin}–{metric.refMax} {metric.unit})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 2xl:gap-3 font-mono">
                    <span className="font-bold text-[#0F2747]">
                      {rawVal} {metric.unit}
                    </span>
                    <span className={`text-[10px] 2xl:text-xs px-2.5 py-0.5 rounded-md border font-semibold ${badgeText}`}>
                      {status}
                    </span>
                  </div>
                </div>

                <div className="relative h-5 2xl:h-6 bg-slate-100 rounded-full overflow-hidden w-full border border-slate-200/70">
                  <div
                    className={`absolute top-0 bottom-0 transition-colors ${
                      isHovered ? "bg-teal-200/90 border-x-2 border-teal-500" : "bg-teal-100/80 border-x border-teal-300/80"
                    }`}
                    style={{ left: `${refMinPercent}%`, width: `${refWidth}%` }}
                    title={`Optimal target: ${metric.refMin} - ${metric.refMax} ${metric.unit}`}
                  ></div>

                  <div
                    className={`absolute top-0 bottom-0 rounded-full ${indicatorBg} ${indicatorGlow} transform -translate-x-1/2 transition-all duration-300 ${
                      isHovered ? "w-5 2xl:w-6 scale-110" : "w-3 2xl:w-3.5"
                    }`}
                    style={{ left: `${valPercent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Charts Section: Bar Chart & Pie / Donut Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 2xl:gap-8">
        {/* Left Column: Interactive Variance Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 2xl:p-10 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 2xl:pb-5 border-b border-slate-100 mb-5 2xl:mb-6">
              <div className="flex items-center gap-2 2xl:gap-2.5">
                <BarChart3 className="w-4 h-4 2xl:w-5 2xl:h-5 text-[#0F766E]" />
                <h3 className="text-sm 2xl:text-base font-bold text-[#0F2747] uppercase tracking-wide font-mono">
                  Measurement Variance Bar Chart
                </h3>
              </div>
              <span className="text-[11px] 2xl:text-xs text-slate-400 font-mono">Hover bar for details</span>
            </div>

            {/* Active Inspect Card */}
            <div className="h-12 2xl:h-14 flex items-center justify-between bg-slate-50/90 px-4 rounded-xl border border-slate-200/70 mb-3 text-xs 2xl:text-sm">
              {selectedBar ? (
                <div className="flex items-center justify-between w-full font-mono animate-fadeIn">
                  <span className="font-bold text-[#0F2747]">{selectedBar.name}:</span>
                  <span className="text-slate-600">
                    {selectedBar.value} {selectedBar.unit} (Target: {selectedBar.refMin}–{selectedBar.refMax})
                  </span>
                  <span
                    className={`text-[10px] 2xl:text-xs px-2.5 py-0.5 rounded font-semibold border ${
                      selectedBar.severity === "critical"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : selectedBar.severity === "concerning"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {selectedBar.status}
                  </span>
                </div>
              ) : (
                <div className="text-slate-400 text-xs 2xl:text-sm italic">
                  Hover or click any parameter bar below to inspect clinical values.
                </div>
              )}
            </div>

            {/* Interactive Vertical Comparison Bars */}
            <div
              className="grid gap-2 sm:gap-3 2xl:gap-4 items-end h-60 2xl:h-72 pt-3 pb-1 px-1"
              style={{
                gridTemplateColumns: `repeat(${chartableMetrics.length}, minmax(0, 1fr))`,
              }}
            >
              {chartableMetrics.map((metric) => {
                const rawVal = parsedValues[metric.key];
                const paramResult = parameterResults.find((p) => p.key === metric.key);
                const status = paramResult?.status || "Normal";
                const severity = paramResult?.severity || "normal";

                const isBarActive = selectedBar?.key === metric.key;

                const midOptimal = (metric.refMin + metric.refMax) / 2;
                const ratio = rawVal ? (rawVal / midOptimal) * 100 : 100;
                const barHeight = Math.max(18, Math.min(100, ratio));

                let barColor = "bg-emerald-500 hover:bg-emerald-600";
                if (severity === "critical" || status === "Outside expected range") {
                  barColor = "bg-rose-600 hover:bg-rose-700";
                } else if (severity === "concerning" || status === "Concerning") {
                  barColor = "bg-amber-500 hover:bg-amber-600";
                }

                return (
                  <div
                    key={metric.key}
                    onMouseEnter={() =>
                      setSelectedBar({
                        key: metric.key,
                        name: metric.name,
                        value: rawVal,
                        unit: metric.unit,
                        refMin: metric.refMin,
                        refMax: metric.refMax,
                        status,
                        severity,
                      })
                    }
                    onClick={() =>
                      setSelectedBar({
                        key: metric.key,
                        name: metric.name,
                        value: rawVal,
                        unit: metric.unit,
                        refMin: metric.refMin,
                        refMax: metric.refMax,
                        status,
                        severity,
                      })
                    }
                    className="flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    <div className="w-full flex items-end justify-center h-44 2xl:h-52 bg-slate-100/60 rounded-xl p-1 relative">
                      <div
                        className={`w-full rounded-lg transition-all duration-300 ${barColor} ${
                          isBarActive ? "ring-2 ring-teal-500 shadow-md scale-102" : "opacity-90 group-hover:opacity-100"
                        }`}
                        style={{ height: `${barHeight}%` }}
                      ></div>
                    </div>

                    <span
                      className={`text-[10px] sm:text-xs font-mono mt-2 transition-colors truncate max-w-full text-center ${
                        isBarActive ? "font-bold text-[#0F766E]" : "text-slate-500 group-hover:text-[#0F2747]"
                      }`}
                    >
                      {metric.shortName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] 2xl:text-xs text-slate-400 font-mono">
            <span>Bars normalized against optimal median</span>
            <span>{chartableMetrics.length} metrics charted</span>
          </div>
        </div>

        {/* Right Column: Interactive Physiological Status Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 2xl:p-10 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 2xl:pb-5 border-b border-slate-100 mb-5 2xl:mb-6">
              <div className="flex items-center gap-2 2xl:gap-2.5">
                <PieChart className="w-4 h-4 2xl:w-5 2xl:h-5 text-[#0F766E]" />
                <h3 className="text-sm 2xl:text-base font-bold text-[#0F2747] uppercase tracking-wide font-mono">
                  Status Distribution Breakdown
                </h3>
              </div>
              <span className="text-[11px] 2xl:text-xs text-slate-400 font-mono">Interactive Segment Donut</span>
            </div>

            {/* Donut Chart & Legend Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 2xl:gap-8 py-2">
              {/* SVG Donut Graphic */}
              <div className="relative w-44 h-44 2xl:w-52 2xl:h-52 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="text-slate-100"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                  />

                  {/* Normal Segment (Emerald) */}
                  {normalCount > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke="#10B981"
                      strokeWidth={hoveredSlice === "normal" ? "14" : "12"}
                      strokeDasharray={`${normalStroke} ${circumference}`}
                      strokeDashoffset={normalOffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredSlice("normal")}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  )}

                  {/* Concerning Segment (Amber) */}
                  {concerningCount > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke="#F59E0B"
                      strokeWidth={hoveredSlice === "concerning" ? "14" : "12"}
                      strokeDasharray={`${concerningStroke} ${circumference}`}
                      strokeDashoffset={concerningOffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredSlice("concerning")}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  )}

                  {/* Outside Range Segment (Rose) */}
                  {outsideRangeCount > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke="#E11D48"
                      strokeWidth={hoveredSlice === "outside" ? "14" : "12"}
                      strokeDasharray={`${outsideStroke} ${circumference}`}
                      strokeDashoffset={outsideOffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredSlice("outside")}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  )}
                </svg>

                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  {hoveredSlice ? (
                    <div className="animate-fadeIn">
                      <span className="text-xl 2xl:text-2xl font-bold font-mono text-[#0F2747]">
                        {hoveredSlice === "normal"
                          ? `${normalPercent}%`
                          : hoveredSlice === "concerning"
                          ? `${concerningPercent}%`
                          : `${outsideRangePercent}%`}
                      </span>
                      <span className="block text-[10px] 2xl:text-xs text-slate-500 uppercase font-mono mt-0.5">
                        {hoveredSlice === "normal"
                          ? "Normal"
                          : hoveredSlice === "concerning"
                          ? "Concerning"
                          : "Outside"}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xl 2xl:text-2xl font-bold font-brand text-[#0F2747]">
                        {totalParams}
                      </span>
                      <span className="block text-[10px] 2xl:text-xs text-slate-400 uppercase font-mono mt-0.5">
                        Parameters
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Segment Legend Cards */}
              <div className="space-y-2.5 w-full sm:w-auto">
                {/* Normal Card */}
                <div
                  onMouseEnter={() => setHoveredSlice("normal")}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className={`p-2.5 2xl:p-3 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                    hoveredSlice === "normal"
                      ? "bg-emerald-50/80 border-emerald-300 shadow-2xs"
                      : "bg-slate-50/70 border-slate-200/70 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0"></span>
                    <span className="text-xs 2xl:text-sm font-semibold text-[#1E293B]">Normal Range</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs 2xl:text-sm font-bold text-[#0F2747]">{normalCount}</span>
                    <span className="text-[10px] 2xl:text-xs text-slate-400 ml-1.5">({normalPercent}%)</span>
                  </div>
                </div>

                {/* Concerning Card */}
                <div
                  onMouseEnter={() => setHoveredSlice("concerning")}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className={`p-2.5 2xl:p-3 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                    hoveredSlice === "concerning"
                      ? "bg-amber-50/80 border-amber-300 shadow-2xs"
                      : "bg-slate-50/70 border-slate-200/70 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0"></span>
                    <span className="text-xs 2xl:text-sm font-semibold text-[#1E293B]">Concerning</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs 2xl:text-sm font-bold text-[#0F2747]">{concerningCount}</span>
                    <span className="text-[10px] 2xl:text-xs text-slate-400 ml-1.5">({concerningPercent}%)</span>
                  </div>
                </div>

                {/* Outside Range Card */}
                <div
                  onMouseEnter={() => setHoveredSlice("outside")}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className={`p-2.5 2xl:p-3 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                    hoveredSlice === "outside"
                      ? "bg-rose-50/80 border-rose-300 shadow-2xs"
                      : "bg-slate-50/70 border-slate-200/70 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-600 flex-shrink-0"></span>
                    <span className="text-xs 2xl:text-sm font-semibold text-[#1E293B]">Outside Range</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs 2xl:text-sm font-bold text-[#0F2747]">{outsideRangeCount}</span>
                    <span className="text-[10px] 2xl:text-xs text-slate-400 ml-1.5">({outsideRangePercent}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] 2xl:text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>Hover slices to inspect proportion</span>
            <span>100% Total Coverage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
