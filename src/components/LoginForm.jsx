import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle, User, Mail, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import { registerMember, authenticateMember, resetMemberPassword } from "../services/db";

export default function LoginForm({ onLoginSuccess, initialMode = "signin" }) {
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup' | 'forgot'
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Form input states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Validation & submission states
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: null }));
    }
    if (apiError) setApiError("");
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    if (errors.newPassword) {
      setErrors((prev) => ({ ...prev, newPassword: null }));
    }
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");
    const newErrors = {};

    if (mode === "signup") {
      if (!fullName || fullName.trim().length === 0) {
        newErrors.fullName = "Please enter your full name";
      }
      if (!agreeTerms) {
        newErrors.agreeTerms = "You must agree to the Terms and Privacy Policy";
      }
    }

    if (!email || email.trim().length === 0) {
      newErrors.email = "Please enter your email address";
    }

    if (mode === "forgot") {
      if (!newPassword || newPassword.trim().length === 0) {
        newErrors.newPassword = "Please enter your new password";
      } else if (newPassword.length < 4) {
        newErrors.newPassword = "Password must be at least 4 characters";
      }
    } else {
      if (!password || password.trim().length === 0) {
        newErrors.password = "Please enter your password";
      } else if (password.length < 4) {
        newErrors.password = "Password must be at least 4 characters";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      if (mode === "signup") {
        const result = await registerMember({
          fullName: fullName.trim(),
          email: email.trim(),
          password: password,
        });
        setIsLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess({
            username: result.user.fullName,
            email: result.user.email,
            role: result.user.role,
            fullName: result.user.fullName,
            loginTime: new Date().toLocaleTimeString(),
          });
        }
      } else if (mode === "forgot") {
        await resetMemberPassword({
          email: email.trim(),
          newPassword: newPassword,
        });
        setIsLoading(false);
        setSuccessMessage("Password reset successfully! You can now sign in with your new password.");
        setPassword("");
        setNewPassword("");
        setTimeout(() => {
          switchMode("signin");
        }, 1500);
      } else {
        const result = await authenticateMember({
          email: email.trim(),
          password: password,
        });
        setIsLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess({
            username: result.user.fullName,
            email: result.user.email,
            role: result.user.role,
            fullName: result.user.fullName,
            loginTime: new Date().toLocaleTimeString(),
          });
        }
      }
    } catch (err) {
      setIsLoading(false);
      setApiError(err.message || "An error occurred during authentication.");
    }
  };

  const switchMode = (newMode) => {
    setIsTransitioning(true);
    setErrors({});
    setApiError("");
    setSuccessMessage("");
    setShowPassword(false);
    setShowNewPassword(false);
    setTimeout(() => {
      setMode(newMode);
      setIsTransitioning(false);
    }, 150);
  };

  return (
    <div className="w-full">
      {/* Subtitle based on Mode */}
      <p
        className={`text-xs sm:text-sm text-slate-500 mb-5 font-medium transition-all duration-300 ${
          isTransitioning ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
        }`}
      >
        {mode === "signup"
          ? "Create your account to get started."
          : mode === "forgot"
          ? "Reset your password to regain access."
          : "Please enter your details to sign in."}
      </p>

      {/* Global API Error Banner */}
      {apiError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200/80 text-left flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-red-700 leading-relaxed font-medium">{apiError}</span>
        </div>
      )}

      {/* Global Success Banner */}
      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-left flex items-start gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-emerald-800 leading-relaxed font-medium">{successMessage}</span>
        </div>
      )}

      {/* Form Fields */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className={`space-y-4 text-left transition-all duration-300 ${
          isTransitioning ? "opacity-0 scale-98" : "opacity-100 scale-100"
        }`}
      >
        {/* Full Name Field (Sign Up Only) with User Icon */}
        {mode === "signup" && (
          <div className="animate-fadeIn">
            <label
              htmlFor="fullName"
              className="block text-xs font-semibold text-[#1E293B] mb-1.5"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
                  if (apiError) setApiError("");
                }}
                autoComplete="name"
                className={`w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border text-sm text-[#1E293B] transition-all outline-none ${
                  errors.fullName
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-slate-300 hover:border-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-teal-50"
                }`}
              />
            </div>
            {errors.fullName && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{errors.fullName}</span>
              </div>
            )}
          </div>
        )}

        {/* E-Mail Address Field with Mail Icon (Sign In, Sign Up, & Forgot) */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-[#1E293B] mb-1.5"
          >
            E-Mail Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                if (apiError) setApiError("");
              }}
              autoComplete="email"
              className={`w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border text-sm text-[#1E293B] transition-all outline-none ${
                errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-slate-300 hover:border-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-teal-50"
              }`}
            />
          </div>
          {errors.email && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        {/* Password Field with Lock Icon (Sign In & Sign Up) */}
        {mode !== "forgot" && (
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-[#1E293B] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handlePasswordChange}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className={`w-full pl-10 pr-11 py-2.5 bg-white rounded-xl border text-sm text-[#1E293B] transition-all outline-none ${
                  errors.password
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-slate-300 hover:border-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-teal-50"
                }`}
              />
              {password.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#0F766E] transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            {errors.password && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{errors.password}</span>
              </div>
            )}
          </div>
        )}

        {/* New Password Field (Forgot Password Mode) */}
        {mode === "forgot" && (
          <div className="animate-fadeIn">
            <label
              htmlFor="newPassword"
              className="block text-xs font-semibold text-[#1E293B] mb-1.5"
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Enter at least 4 characters"
                value={newPassword}
                onChange={handleNewPasswordChange}
                autoComplete="new-password"
                className={`w-full pl-10 pr-11 py-2.5 bg-white rounded-xl border text-sm text-[#1E293B] transition-all outline-none ${
                  errors.newPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-slate-300 hover:border-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-teal-50"
                }`}
              />
              {newPassword.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#0F766E] transition-colors focus:outline-none cursor-pointer"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            {errors.newPassword && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{errors.newPassword}</span>
              </div>
            )}
          </div>
        )}

        {/* Checkbox Row (Sign In Mode) */}
        {mode === "signin" && (
          <div className="flex items-center justify-between pt-0.5 text-xs">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E] accent-[#0F766E] cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="text-slate-500 hover:text-[#0F766E] hover:underline transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* Checkbox Row (Sign Up Mode) */}
        {mode === "signup" && (
          <div className="pt-0.5 animate-fadeIn">
            <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: null }));
                  if (apiError) setApiError("");
                }}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E] accent-[#0F766E] cursor-pointer flex-shrink-0"
              />
              <span>
                I agree to the{" "}
                <span className="text-[#0F766E] font-medium hover:underline">Terms of Service</span> and{" "}
                <span className="text-[#0F766E] font-medium hover:underline">Privacy Policy</span>
              </span>
            </label>
            {errors.agreeTerms && (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{errors.agreeTerms}</span>
              </div>
            )}
          </div>
        )}

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#0F2747] hover:bg-[#0A1B33] active:bg-[#071324] text-white font-medium rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E] disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                <span>
                  {mode === "signup"
                    ? "Creating account..."
                    : mode === "forgot"
                    ? "Resetting password..."
                    : "Signing in..."}
                </span>
              </div>
            ) : (
              <span>
                {mode === "signup"
                  ? "Create account"
                  : mode === "forgot"
                  ? "Reset password"
                  : "Sign in"}
              </span>
            )}
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="text-center pt-2 text-xs text-slate-500">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="font-semibold text-[#0F766E] hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </>
          ) : mode === "forgot" ? (
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="inline-flex items-center gap-1.5 font-semibold text-[#0F766E] hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          ) : (
            <>
              Don&apos;t have an account yet?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="font-semibold text-[#0F2747] hover:text-[#0F766E] hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
