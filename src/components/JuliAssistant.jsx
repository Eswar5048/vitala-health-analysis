import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User, AlertCircle } from "lucide-react";
import { sendJuliChatMessage } from "../services/juliService";

export default function JuliAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]); // Strictly empty initially (no fake messages)
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue || inputValue.trim().length === 0 || isLoading) return;

    const userText = inputValue.trim();
    const newMessages = [...messages, { sender: "user", text: userText, time: new Date().toLocaleTimeString() }];
    setMessages(newMessages);
    setInputValue("");
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await sendJuliChatMessage(userText, messages);
      setMessages((prev) => [
        ...prev,
        {
          sender: "juli",
          text: response.reply,
          time: response.timestamp || new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      setErrorMessage(err.message || "Unable to receive response from Juli.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-7 right-7 2xl:bottom-9 2xl:right-9 z-40">
      {/* Minimized Floating Entry Point */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 px-5 py-3.5 2xl:px-6 2xl:py-4 bg-[#0F2747] hover:bg-[#0A1B33] text-white rounded-full shadow-xl border border-teal-500/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Open Juli Health Assistant"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></div>
          <Sparkles className="w-5 h-5 2xl:w-5.5 2xl:h-5.5 text-teal-300" />
          <span className="font-brand text-sm 2xl:text-base font-bold tracking-tight">Juli</span>
        </button>
      )}

      {/* Compact Interactive Assistant Panel */}
      {isOpen && (
        <div className="w-88 sm:w-[420px] 2xl:w-[460px] h-[520px] 2xl:h-[580px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col animate-fadeIn text-left">
          {/* Header */}
          <div className="p-4 2xl:p-5 bg-[#0F2747] text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5 2xl:gap-3">
              <div className="p-2 2xl:p-2.5 bg-teal-500/20 rounded-xl text-teal-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-brand text-sm 2xl:text-base font-bold leading-tight">Juli</div>
                <div className="text-xs 2xl:text-sm text-slate-300 font-mono mt-0.5">Educational Health Assistant</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 2xl:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Minimize Juli"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Body (Empty state when first opened) */}
          <div className="flex-1 p-4 2xl:p-5 bg-slate-50 overflow-y-auto space-y-3.5 2xl:space-y-4 text-xs sm:text-sm 2xl:text-base">
            {messages.length === 0 ? (
              /* Strictly Clean Initial Empty State */
              <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
                <div className="w-12 h-12 2xl:w-14 2xl:h-14 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-[#0F766E] shadow-2xs mb-3">
                  <Bot className="w-6 h-6 2xl:w-7 2xl:h-7" />
                </div>
                <p className="font-bold text-[#0F2747] text-sm 2xl:text-base mb-1">
                  How can I help you today?
                </p>
                <p className="text-xs 2xl:text-sm text-slate-400 max-w-[280px] leading-relaxed">
                  Ask general questions about health measurements, physiological terms, or navigating the platform.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "juli" && (
                    <div className="w-7 h-7 2xl:w-8 2xl:h-8 rounded-lg bg-[#0F2747] text-teal-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-3.5 2xl:p-4 rounded-2xl text-xs sm:text-sm 2xl:text-base leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#0F2747] text-white rounded-br-xs"
                        : "bg-white text-[#1E293B] border border-slate-200/80 rounded-bl-xs shadow-2xs whitespace-pre-line"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.sender === "user" && (
                    <div className="w-7 h-7 2xl:w-8 2xl:h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold font-mono">
                      U
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="font-mono ml-1">Juli is typing...</span>
              </div>
            )}

            {/* Error in chat */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 2xl:p-4 bg-white border-t border-slate-100 flex items-center gap-2 flex-shrink-0"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Juli a health question..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 2xl:py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm 2xl:text-base outline-none focus:border-[#0F766E] focus:bg-white transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 2xl:p-3 bg-[#0F2747] hover:bg-[#0A1B33] text-white rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
              title="Send Message"
            >
              <Send className="w-4 h-4 2xl:w-5 2xl:h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
