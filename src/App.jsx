import React, { useState, useEffect } from "react";
import Logo from "./components/Logo";
import VideoSection from "./components/VideoSection";
import LoginForm from "./components/LoginForm";
import MainDashboard from "./components/MainDashboard";
import { getActiveSession, clearSession } from "./services/db";

export default function App() {
  const [session, setSession] = useState(() => {
    const existing = getActiveSession();
    return existing ? { username: existing.fullName, email: existing.email, role: existing.role, fullName: existing.fullName } : null;
  });
  const [isIntroActive, setIsIntroActive] = useState(true);

  // Triggered when 4s line sweep touches the right edge
  const handleSweepComplete = () => {
    setIsIntroActive(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIntroActive(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleSkipIntro = () => {
    setIsIntroActive(false);
  };

  const handleLoginSuccess = (userData) => {
    setSession(userData);
  };

  const handleSignOut = () => {
    clearSession();
    setSession(null);
  };

  const handleUpdateSession = (updatedSession) => {
    setSession({
      username: updatedSession.fullName,
      email: updatedSession.email,
      fullName: updatedSession.fullName,
    });
  };

  const brandLetters = ["V", "I", "T", "A", "L", "A"];
  const letterDelays = ["0.35s", "0.85s", "1.35s", "1.85s", "2.35s", "2.85s"];

  return (
    <div className="min-h-screen bg-[#08162B] text-[#1E293B] flex flex-col justify-between selection:bg-teal-100 selection:text-teal-900 relative overflow-hidden">
      {session ? (
        /* Logged-in State: Render Main Dashboard */
        <MainDashboard
          session={session}
          onSignOut={handleSignOut}
          onUpdateSession={handleUpdateSession}
        />
      ) : (
        <>
          {/* Background Live Video Stream (Rich Dark Blue/Navy Medical Background) */}
          <div
            className={`fixed inset-0 z-0 transition-all duration-1000 ease-out ${
              isIntroActive
                ? "opacity-100 scale-100"
                : "opacity-90 scale-100"
            }`}
          >
            <VideoSection
              className="w-full h-full border-0 rounded-none shadow-none"
              isFullscreenIntro={isIntroActive}
              onSweepComplete={handleSweepComplete}
            />
          </div>

          {/* Subtle Ambient Radial Lighting Vignette */}
          <div
            className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${
              isIntroActive ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="absolute inset-0 bg-radial from-transparent via-[#08162B]/20 to-[#08162B]/60"></div>

            {/* Concentric Geometric Blueprint Arcs */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-35">
              <div className="w-[500px] h-[500px] rounded-full border border-teal-500/40"></div>
              <div className="absolute w-[750px] h-[750px] rounded-full border border-teal-500/30"></div>
              <div className="absolute w-[1050px] h-[1050px] rounded-full border border-teal-500/20"></div>
            </div>
          </div>

          {/* 4-Second Character-by-Character Centered Brand Reveal Intro */}
          {isIntroActive && (
            <div className="fixed inset-0 z-30 flex flex-col items-center justify-center pointer-events-none px-4 select-none">
              {/* Glowing Animated Logo */}
              <div
                className="animate-letter mb-4 flex justify-center"
                style={{ animationDelay: "0.15s" }}
              >
                <Logo className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_25px_rgba(20,184,166,0.6)]" size={72} />
              </div>

              {/* Staggered Character Reveal for V I T A L A with Ease-In & Fade */}
              <div className="flex items-center justify-center space-x-2 sm:space-x-4">
                {brandLetters.map((letter, idx) => (
                  <span
                    key={idx}
                    className="animate-letter font-brand text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-widest drop-shadow-[0_0_20px_rgba(20,184,166,0.5)]"
                    style={{ animationDelay: letterDelays[idx] }}
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top Header Watermark: Pure White Vitala on Top-Left */}
          <header
            className={`relative z-20 w-full px-6 sm:px-10 py-6 flex items-center justify-between transition-all duration-700 ease-out ${
              isIntroActive
                ? "opacity-0 -translate-y-4 pointer-events-none"
                : "opacity-100 translate-y-0"
            }`}
          >
            <div className="flex items-center gap-3 group cursor-pointer">
              <Logo className="w-10 h-10" size={40} />
              <span className="font-brand text-2xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                Vitala
              </span>
            </div>
          </header>

          {/* Main Experience: Centered Auth Card */}
          <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
            <div className="w-full max-w-md">
              {/* Centered Auth Card with Rise-Up & Spring Pop-In Entrance */}
              <div
                className={`w-full bg-white/95 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] p-7 sm:p-9 text-center transition-all duration-800 cubic-bezier(0.34,1.56,0.64,1) ${
                  isIntroActive
                    ? "opacity-0 scale-75 translate-y-20 pointer-events-none"
                    : "opacity-100 scale-100 translate-y-0"
                }`}
              >
                {/* Centered Dynamic Logo */}
                <div className="flex justify-center mb-3">
                  <Logo className="w-16 h-16" size={64} />
                </div>

                {/* Bold Vitala Title */}
                <h1 className="font-brand text-3xl sm:text-4xl font-extrabold text-[#0F2747] tracking-tight leading-none mb-1.5">
                  Vitala
                </h1>

                {/* Form Component (Handles Sign In & Sign Up Modes) */}
                <LoginForm onLoginSuccess={handleLoginSuccess} />
              </div>
            </div>
          </main>

          {/* Skip Intro Button during 4s sweep */}
          {isIntroActive && (
            <div className="fixed bottom-6 right-6 z-40 animate-fadeIn">
              <button
                onClick={handleSkipIntro}
                className="px-4 py-2 bg-[#08162B]/85 hover:bg-[#08162B] border border-teal-600/40 text-slate-300 hover:text-white text-xs font-medium rounded-none backdrop-blur-sm transition-all cursor-pointer shadow-md hover:shadow-lg"
              >
                Skip Intro
              </button>
            </div>
          )}

          {/* Minimal Clean Footer */}
          <footer
            className={`relative z-20 w-full py-4 px-6 text-center text-xs text-slate-400 transition-opacity duration-700 ${
              isIntroActive ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <span className="font-brand text-xs font-bold tracking-tight text-slate-300">Vitala</span>
          </footer>
        </>
      )}
    </div>
  );
}
