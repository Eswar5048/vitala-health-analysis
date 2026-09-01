/**
 * Vitala Juli Assistant Service
 * Client communication service with backend Juli endpoint (/api/juli-chat).
 * Uses GEMINI_JULI_API_KEY securely configured on backend.
 */

export async function sendJuliChatMessage(message, conversationHistory = []) {
  if (!message || message.trim().length === 0) {
    throw new Error("Message cannot be empty.");
  }

  const response = await fetch("/api/juli-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message.trim(),
      conversationHistory,
    }),
  });

  if (!response.ok) {
    throw new Error("Juli assistant is momentarily unavailable. Please try again.");
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Failed to receive response from Juli.");
  }

  return result;
}
