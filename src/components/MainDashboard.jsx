import React, { useState } from "react";
import Header from "./Header";
import FeatureNavigation from "./FeatureNavigation";
import PredictWorkspace from "./PredictWorkspace";
import SymptomAnalysisWorkspace from "./SymptomAnalysisWorkspace";
import NearbyCareWorkspace from "./NearbyCareWorkspace";
import HealthHistoryWorkspace from "./HealthHistoryWorkspace";
import JuliAssistant from "./JuliAssistant";

export default function MainDashboard({ session, onSignOut, onUpdateSession }) {
  const [activeFeature, setActiveFeature] = useState("predict"); // 'predict' | 'symptom-analysis' | 'nearby-care' | 'history'

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Application Header */}
      <Header session={session} onSignOut={onSignOut} onUpdateSession={onUpdateSession} />

      {/* Main Workspace Layout (Wide Desktop Viewport: max-w-[1600px] / 2xl:max-w-[1760px]) */}
      <div className="flex-1 max-w-[1600px] 2xl:max-w-[1760px] w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-6 sm:py-8 2xl:py-10">
        <div className="flex flex-col md:flex-row gap-5 lg:gap-6 2xl:gap-8 items-start">
          {/* Left Side: Feature Navigation */}
          <FeatureNavigation
            activeFeature={activeFeature}
            onSelectFeature={setActiveFeature}
          />

          {/* Center / Main Content Area: Selected Feature Workspace */}
          <main className="flex-1 w-full min-w-0">
            {activeFeature === "predict" ? (
              <PredictWorkspace
                session={session}
                onNavigateToCare={() => setActiveFeature("nearby-care")}
              />
            ) : activeFeature === "symptom-analysis" ? (
              <SymptomAnalysisWorkspace
                session={session}
                onNavigateToCare={() => setActiveFeature("nearby-care")}
              />
            ) : activeFeature === "nearby-care" ? (
              <NearbyCareWorkspace session={session} />
            ) : (
              <HealthHistoryWorkspace session={session} />
            )}
          </main>
        </div>
      </div>

      {/* Optional Unobtrusive Assistant (Bottom Right) */}
      <JuliAssistant />

      {/* Subtle Healthcare Footer */}
      <footer className="w-full py-6 border-t border-slate-200/60 bg-white text-center text-xs sm:text-sm text-slate-400">
        <div className="max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-5 sm:px-8 lg:px-12 2xl:px-16 flex items-center justify-between">
          <span className="font-brand font-bold text-slate-600">Vitala</span>
          <span>Health Analysis Platform</span>
        </div>
      </footer>
    </div>
  );
}
