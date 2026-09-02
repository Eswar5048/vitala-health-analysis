import React, { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown, UserCog } from "lucide-react";
import Logo from "./Logo";
import EditAccountModal from "./EditAccountModal";

export default function Header({ session, onSignOut, onUpdateSession }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = session?.fullName || session?.username || session?.email || "Account";
  const displayEmail = session?.email || "";

  // Generate initials
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "AC";

  const handleProfileUpdated = (updatedSession) => {
    if (onUpdateSession) {
      onUpdateSession(updatedSession);
    }
  };

  return (
    <>
      <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1600px] 2xl:max-w-[1760px] mx-auto px-5 sm:px-8 lg:px-12 2xl:px-16 h-20 2xl:h-22 flex items-center justify-between">
          {/* TOP-LEFT: Application Brand + Account Control */}
          <div className="flex items-center gap-5 sm:gap-7 2xl:gap-8">
            {/* Logo & Application Name */}
            <div className="flex items-center gap-3.5 2xl:gap-4">
              <Logo className="w-10 h-10 2xl:w-11 2xl:h-11" size={44} />
              <span className="font-brand text-2xl 2xl:text-3xl font-bold text-[#0F2747] tracking-tight leading-tight">
                Vital
              </span>
            </div>

            {/* Divider */}
            <div className="h-6 2xl:h-7 w-px bg-slate-200 hidden sm:block"></div>

            {/* Account Control on TOP-LEFT */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 py-1.5 2xl:py-2 px-3 2xl:px-4 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 cursor-pointer"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                title="Account Options"
              >
                {/* Avatar Initials Badge */}
                <div className="w-8 h-8 2xl:w-9 2xl:h-9 rounded-lg bg-[#0F2747] text-white flex items-center justify-center font-brand font-semibold text-xs 2xl:text-sm tracking-wider">
                  {initials}
                </div>

                {/* Name (Desktop) */}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs 2xl:text-sm font-semibold text-[#1E293B] leading-snug truncate max-w-[160px]">
                    {displayName}
                  </span>
                  <span className="text-[10px] 2xl:text-xs text-slate-500 font-mono leading-none">
                    Account
                  </span>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Account Menu Dropdown */}
              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2.5 z-50 animate-fadeIn text-left divide-y divide-slate-100">
                  {/* Account Details Header */}
                  <div className="px-5 py-3.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block mb-1">
                      Account Information
                    </span>
                    <p className="text-sm font-bold text-[#1E293B]">
                      {displayName}
                    </p>
                    {displayEmail && (
                      <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
                        {displayEmail}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="py-1">
                    {/* Edit Account Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsEditModalOpen(true);
                      }}
                      className="w-full px-5 py-2.5 text-left text-xs 2xl:text-sm font-semibold text-[#0F2747] hover:bg-slate-50 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <UserCog className="w-4 h-4 text-[#0F766E]" />
                      <span>Edit Account Details</span>
                    </button>

                    {/* Sign Out Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (onSignOut) onSignOut();
                      }}
                      className="w-full px-5 py-2.5 text-left text-xs 2xl:text-sm font-semibold text-red-600 hover:bg-red-50/60 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side status indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span className="text-xs 2xl:text-sm font-mono font-medium text-slate-500 hidden sm:inline">
              System Online
            </span>
          </div>
        </div>
      </header>

      {/* Edit Account Modal */}
      <EditAccountModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        session={session}
        onProfileUpdated={handleProfileUpdated}
      />
    </>
  );
}
