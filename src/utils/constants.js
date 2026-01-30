// Theme Colors
export const PRIMARY_BLUE = "#164679";
export const ACCENT_LIME = "#b5d334";
export const SECONDARY_PURPLE = "#7e6496";
export const API_BASE_URL = import.meta.env?.VITE_APP_API_URL || "http://localhost:5000";

// Status Colors Mapping
export const STATUS_COLORS = {
  submitted: { bg: "#d1fae5", color: "#065f46", tag: "green" },
  pendingrm: { bg: "#fee2e2", color: "#991b1b", tag: "red" },
  pendingco: { bg: "#fef3c7", color: "#991b1b", tag: "red" },
  waived: { bg: "#fef3c7", color: "#92400e", tag: "orange" },
  sighted: { bg: "#dbeafe", color: "#1e40af", tag: "blue" },
  deferred: { bg: "#e0e7ff", color: "#3730a3", tag: "purple" },
  tbo: { bg: "#f1f5f9", color: "#475569", tag: "gray" },
  default: { bg: "#f1f5f9", color: "#64748b", tag: "default" }
};

// Allowed Document Actions
export const ALLOWED_DOC_ACTIONS = [
  "submitted_for_review",
  "sighted",
  "waived",
  "deferred",
  "tbo",
  "approved",
  "submitted",
];

// API Endpoints
export const API_ENDPOINTS = {
  UPLOADS: "/api/uploads",
  CHECKLIST_COMMENTS: "/api/checklist/comments",
};