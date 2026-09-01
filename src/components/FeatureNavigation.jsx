import React, { useState } from "react";
import { Activity, Stethoscope, MapPin, History, Info } from "lucide-react";

export default function FeatureNavigation({ activeFeature, onSelectFeature }) {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      id: "predict",
      title: "Predict",
      badge: "Primary",
      icon: Activity,
      tooltip: "Have health-monitoring equipment or smart devices? Use Predict to analyze your measured health values.",
    },
    {
      id: "symptom-analysis",
      title: "Symptom Analysis",
      badge: null,
      icon: Stethoscope,
      tooltip: "Don't have health-monitoring equipment? Describe your symptoms here for analysis.",
    },
    {
      id: "nearby-care",
      title: "Nearby Care & Doctors",
      badge: "Live GPS",
      icon: MapPin,
      tooltip: "Locate open hospitals, specialized clinics, and certified doctors near your real-time GPS location.",
    },
    {
      id: "history",
      title: "Health History",
      badge: null,
      icon: History,
      tooltip: "View and inspect your past health predictions, symptom assessments, and activity logs.",
    },
  ];

  return (
    <aside className="w-full md:w-64 lg:w-72 2xl:w-76 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 2xl:p-5 shadow-xs sticky top-28">
        <div className="px-3 pt-1 pb-3.5 2xl:pb-4">
          <span className="text-xs 2xl:text-sm font-bold text-slate-400 uppercase tracking-wider font-mono">
            Core Features
          </span>
        </div>

        <nav className="space-y-2.5 2xl:space-y-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isSelected = activeFeature === feature.id;
            const isHovered = hoveredFeature === feature.id;

            return (
              <div
                key={feature.id}
                className="relative"
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <button
                  type="button"
                  onClick={() => onSelectFeature(feature.id)}
                  className={`w-full flex items-center justify-between p-4 2xl:p-4.5 rounded-xl text-left transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? "bg-[#0F2747] text-white border-[#0F2747] shadow-sm"
                      : "bg-slate-50/70 hover:bg-slate-100/90 text-[#1E293B] border-slate-200/70 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3.5 2xl:gap-4">
                    <div
                      className={`p-2.5 2xl:p-3 rounded-xl transition-colors ${
                        isSelected
                          ? "bg-teal-500/20 text-teal-300"
                          : "bg-white text-[#0F766E] shadow-2xs border border-slate-200/60"
                      }`}
                    >
                      <Icon className="w-5 h-5 2xl:w-5.5 2xl:h-5.5" />
                    </div>
                    <div>
                      <div className="text-sm sm:text-base 2xl:text-lg font-bold tracking-tight">
                        {feature.title}
                      </div>
                    </div>
                  </div>

                  {feature.badge && (
                    <span
                      className={`text-[11px] 2xl:text-xs font-bold uppercase px-2.5 py-1 rounded-md font-mono ${
                        isSelected
                          ? "bg-teal-400/20 text-teal-300 border border-teal-400/30"
                          : "bg-teal-50 text-[#0F766E] border border-teal-200/60"
                      }`}
                    >
                      {feature.badge}
                    </span>
                  )}
                </button>

                {/* Hover-Only Contextual Tooltip */}
                {isHovered && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 2xl:ml-4 w-76 2xl:w-84 p-4 2xl:p-5 bg-[#08162B] text-white text-xs 2xl:text-sm rounded-2xl shadow-2xl border border-slate-700 z-50 pointer-events-none animate-fadeIn">
                    <div className="flex items-start gap-2.5 2xl:gap-3">
                      <Info className="w-4 h-4 2xl:w-5 2xl:h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs 2xl:text-sm leading-relaxed text-slate-200 font-medium">
                        {feature.tooltip}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
