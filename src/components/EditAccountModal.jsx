import React, { useState } from "react";
import { User, Mail, Lock, CheckCircle2, AlertCircle, X, Shield } from "lucide-react";
import { updateMemberProfile } from "../services/db";

export default function EditAccountModal({ isOpen, onClose, session, onProfileUpdated }) {
  const [fullName, setFullName] = useState(session?.fullName || session?.username || "");
  const [email, setEmail] = useState(session?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateMemberProfile({
        currentEmail: session?.email,
        newEmail: email,
        fullName: fullName,
        currentPassword: isChangingPassword ? currentPassword : "",
        newPassword: isChangingPassword ? newPassword : "",
      });

      setSuccessMessage("Account details updated successfully.");
      if (onProfileUpdated) {
        onProfileUpdated(result.session);
      }

      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to update account details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center border border-teal-100">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F2747] text-base leading-snug">
                Edit Account Details
              </h3>
              <p className="text-xs text-slate-500">
                Update your name, email, or credentials
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 rounded-xl border border-slate-300 focus:border-[#0F766E] focus:bg-white focus:ring-2 focus:ring-teal-50 outline-none transition-all text-sm font-medium text-[#1E293B]"
                placeholder="Your Full Name"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 rounded-xl border border-slate-300 focus:border-[#0F766E] focus:bg-white focus:ring-2 focus:ring-teal-50 outline-none transition-all text-sm font-medium text-[#1E293B]"
                placeholder="your.email@example.com"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Optional Password Change Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="text-xs text-[#0F766E] hover:text-teal-800 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isChangingPassword ? "Cancel Password Change" : "Change Password"}</span>
            </button>
          </div>

          {isChangingPassword && (
            <div className="space-y-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 animate-fadeIn">
              <div>
                <label className="block text-[11px] font-semibold text-[#1E293B] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white rounded-lg border border-slate-300 focus:border-[#0F766E] text-xs outline-none"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1E293B] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white rounded-lg border border-slate-300 focus:border-[#0F766E] text-xs outline-none"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-[#0F2747] hover:bg-[#0A1B33] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60 shadow-xs"
            >
              {isLoading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
