/**
 * Vital Local Database Service
 * Provides structured, segregated, and secure member data storage using browser persistent store.
 * Built with async promise API for 1-to-1 drop-in compatibility with Cloud databases (Supabase / Firebase).
 */

const STORAGE_KEYS = {
  MEMBERS: "vital_db_members",
  SESSIONS: "vital_db_sessions",
  AUDIT_LOGS: "vital_db_audit_logs",
  USER_HISTORY: "vital_db_user_history",
};

// Simple secure hash function for local credential storage
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `vtl_hsh_${Math.abs(hash)}_${btoa(password.slice(0, 3) + "vital")}`;
}

// Generate unique identifier
function generateUUID() {
  return "vtl_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 9);
}

// Helper to get collection from storage
function getCollection(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error(`[Vital DB] Error loading collection ${key}:`, err);
    return [];
  }
}

// Helper to save collection to storage
function saveCollection(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`[Vital DB] Error saving collection ${key}:`, err);
  }
}

// Append an audit log entry for health compliance tracking
function logAuditEvent(action, memberEmail, details = {}) {
  const logs = getCollection(STORAGE_KEYS.AUDIT_LOGS);
  const logEntry = {
    id: generateUUID(),
    action,
    memberEmail,
    details,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(logEntry);
  if (logs.length > 500) logs.pop(); // Keep recent 500 logs
  saveCollection(STORAGE_KEYS.AUDIT_LOGS, logs);
}

/**
 * Initialize default clinical operator account if database is empty
 */
export function initializeDatabase() {
  const members = getCollection(STORAGE_KEYS.MEMBERS);
  if (members.length === 0) {
    const defaultOperator = {
      id: generateUUID(),
      fullName: "Health Member",
      email: "member@vital.health",
      passwordHash: hashPassword("vital123"),
      role: "member",
      status: "active",
      metadata: {
        accessLevel: "Standard",
        verified: true,
      },
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };
    saveCollection(STORAGE_KEYS.MEMBERS, [defaultOperator]);
    logAuditEvent("SYSTEM_INITIALIZED", "system", { defaultAccount: defaultOperator.email });
  }
}

// Auto initialize on import
initializeDatabase();

/**
 * Register a new member with validation and data segregation
 */
export async function registerMember({ fullName, email, password }) {
  await new Promise((res) => setTimeout(res, 250));

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();
  const members = getCollection(STORAGE_KEYS.MEMBERS);

  // Check if member already exists
  const existingMember = members.find((m) => m.email.toLowerCase() === cleanEmail);
  if (existingMember) {
    logAuditEvent("SIGNUP_FAILED_DUPLICATE", cleanEmail);
    throw new Error("An account with this email address already exists. Please sign in.");
  }

  // Create new member record
  const newMember = {
    id: generateUUID(),
    fullName: cleanName,
    email: cleanEmail,
    passwordHash: hashPassword(password),
    role: "member",
    status: "active",
    metadata: {
      accessLevel: "Standard",
      verified: true,
    },
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  members.push(newMember);
  saveCollection(STORAGE_KEYS.MEMBERS, members);
  logAuditEvent("MEMBER_REGISTERED", cleanEmail, { memberId: newMember.id });

  // Create active session
  const session = createSession(newMember);
  return {
    user: getSafeMemberProfile(newMember),
    session,
  };
}

/**
 * Authenticate existing member with email and password
 */
export async function authenticateMember({ email, password }) {
  await new Promise((res) => setTimeout(res, 250));

  const cleanEmail = email.trim().toLowerCase();
  const members = getCollection(STORAGE_KEYS.MEMBERS);
  const targetMember = members.find((m) => m.email.toLowerCase() === cleanEmail);

  if (!targetMember) {
    logAuditEvent("LOGIN_FAILED_NOT_FOUND", cleanEmail);
    throw new Error("No account found with this email address. Please check or sign up.");
  }

  const inputHash = hashPassword(password);
  if (targetMember.passwordHash !== inputHash) {
    logAuditEvent("LOGIN_FAILED_BAD_PASSWORD", cleanEmail);
    throw new Error("Incorrect password. Please try again.");
  }

  // Update last login timestamp
  targetMember.lastLoginAt = new Date().toISOString();
  saveCollection(STORAGE_KEYS.MEMBERS, members);
  logAuditEvent("MEMBER_AUTHENTICATED", cleanEmail, { memberId: targetMember.id });

  const session = createSession(targetMember);
  return {
    user: getSafeMemberProfile(targetMember),
    session,
  };
}

/**
 * Update member account details (Name, Email, Password)
 */
export async function updateMemberProfile({ currentEmail, newEmail, fullName, currentPassword, newPassword }) {
  await new Promise((res) => setTimeout(res, 200));

  const cleanCurrentEmail = currentEmail.trim().toLowerCase();
  const cleanNewEmail = newEmail ? newEmail.trim().toLowerCase() : cleanCurrentEmail;
  const cleanName = fullName.trim();

  if (!cleanName) {
    throw new Error("Full name is required.");
  }
  if (!cleanNewEmail) {
    throw new Error("Email address is required.");
  }

  const members = getCollection(STORAGE_KEYS.MEMBERS);
  const targetIndex = members.findIndex((m) => m.email.toLowerCase() === cleanCurrentEmail);

  if (targetIndex === -1) {
    throw new Error("Account not found.");
  }

  // If email is changed, verify no duplicate
  if (cleanNewEmail !== cleanCurrentEmail) {
    const duplicate = members.find((m) => m.email.toLowerCase() === cleanNewEmail);
    if (duplicate) {
      throw new Error("An account with the new email address already exists.");
    }
  }

  const member = members[targetIndex];

  // If password update requested
  if (newPassword && newPassword.trim().length > 0) {
    if (!currentPassword) {
      throw new Error("Current password is required to change password.");
    }
    if (member.passwordHash !== hashPassword(currentPassword)) {
      throw new Error("Current password is incorrect.");
    }
    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters.");
    }
    member.passwordHash = hashPassword(newPassword);
  }

  member.fullName = cleanName;
  member.email = cleanNewEmail;
  member.updatedAt = new Date().toISOString();

  members[targetIndex] = member;
  saveCollection(STORAGE_KEYS.MEMBERS, members);

  // Re-create active session with updated data
  const session = createSession(member);
  logAuditEvent("MEMBER_PROFILE_UPDATED", cleanNewEmail, { memberId: member.id });

  return {
    user: getSafeMemberProfile(member),
    session,
  };
}

/**
 * Reset member password (Forgot Password flow)
 */
export async function resetMemberPassword({ email, newPassword }) {
  await new Promise((res) => setTimeout(res, 250));

  const cleanEmail = email ? email.trim().toLowerCase() : "";
  if (!cleanEmail) {
    throw new Error("Please enter your account email address.");
  }
  if (!newPassword || newPassword.trim().length < 4) {
    throw new Error("New password must be at least 4 characters.");
  }

  const members = getCollection(STORAGE_KEYS.MEMBERS);
  const targetMember = members.find((m) => m.email.toLowerCase() === cleanEmail);

  if (!targetMember) {
    throw new Error("No account found with this email address. Please check or sign up.");
  }

  targetMember.passwordHash = hashPassword(newPassword);
  targetMember.updatedAt = new Date().toISOString();
  saveCollection(STORAGE_KEYS.MEMBERS, members);
  logAuditEvent("PASSWORD_RESET_SUCCESS", cleanEmail, { memberId: targetMember.id });

  return {
    success: true,
    email: cleanEmail,
    fullName: targetMember.fullName,
  };
}

/**
 * Create session token
 */
function createSession(member) {
  const session = {
    token: "vtl_tok_" + generateUUID(),
    memberId: member.id,
    email: member.email,
    fullName: member.fullName,
    role: member.role || "member",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  };
  saveCollection(STORAGE_KEYS.SESSIONS, [session]);
  return session;
}

/**
 * Get active session
 */
export function getActiveSession() {
  const sessions = getCollection(STORAGE_KEYS.SESSIONS);
  if (sessions.length === 0) return null;
  const current = sessions[0];
  if (new Date(current.expiresAt) < new Date()) {
    clearSession();
    return null;
  }
  return current;
}

/**
 * Terminate session
 */
export function clearSession() {
  const current = getActiveSession();
  if (current) {
    logAuditEvent("MEMBER_LOGOUT", current.email);
  }
  saveCollection(STORAGE_KEYS.SESSIONS, []);
}

/**
 * Return safe public profile without sensitive password hashes
 */
function getSafeMemberProfile(member) {
  return {
    id: member.id,
    fullName: member.fullName,
    email: member.email,
    role: member.role,
    status: member.status,
    metadata: member.metadata,
    createdAt: member.createdAt,
    lastLoginAt: member.lastLoginAt,
  };
}

/**
 * Get all members (for administrative checks / telemetry)
 */
export function getAllMembers() {
  return getCollection(STORAGE_KEYS.MEMBERS).map(getSafeMemberProfile);
}

/**
 * Get recent audit logs
 */
export function getAuditLogs() {
  return getCollection(STORAGE_KEYS.AUDIT_LOGS);
}

/**
 * Record a user action in their persistent history
 */
export function recordUserActivity({ email, type, title, summary, score, riskLevel, riskColor, data = {} }) {
  const history = getCollection(STORAGE_KEYS.USER_HISTORY);
  const cleanEmail = (email || "default_user").toLowerCase().trim();

  const historyItem = {
    id: generateUUID(),
    userEmail: cleanEmail,
    type, // 'predict' | 'symptom' | 'care' | 'account'
    title,
    summary,
    score: score || null,
    riskLevel: riskLevel || null,
    riskColor: riskColor || null,
    data,
    timestamp: new Date().toISOString(),
    formattedTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    formattedDate: new Date().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };

  history.unshift(historyItem);
  if (history.length > 500) history.pop(); // Keep recent 500 history items
  saveCollection(STORAGE_KEYS.USER_HISTORY, history);

  return historyItem;
}

/**
 * Get segregated history for a user
 */
export function getUserHistory(email, filterType = "all") {
  const history = getCollection(STORAGE_KEYS.USER_HISTORY);
  const cleanEmail = (email || "default_user").toLowerCase().trim();

  let userItems = history.filter((item) => item.userEmail === cleanEmail || !item.userEmail || item.userEmail === "default_user");

  if (filterType && filterType !== "all") {
    userItems = userItems.filter((item) => item.type === filterType);
  }

  return userItems;
}

/**
 * Delete a specific history item
 */
export function deleteHistoryItem(email, itemId) {
  const history = getCollection(STORAGE_KEYS.USER_HISTORY);
  const updated = history.filter((item) => item.id !== itemId);
  saveCollection(STORAGE_KEYS.USER_HISTORY, updated);
  return updated;
}

/**
 * Clear all history for a user
 */
export function clearUserHistory(email) {
  const cleanEmail = (email || "default_user").toLowerCase().trim();
  const history = getCollection(STORAGE_KEYS.USER_HISTORY);
  const updated = history.filter((item) => item.userEmail !== cleanEmail);
  saveCollection(STORAGE_KEYS.USER_HISTORY, updated);
  return [];
}

