// src/api/apiPaths.js

export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  // ================= AUTH =================
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
    UPDATE_PROFILE: "/api/auth/profile",
    CHANGE_PASSWORD: "/api/auth/change-password",
    REFRESH_TOKEN: "/api/auth/refresh-token",
  },

  // ================= DOCUMENTS =================
  DOCUMENTS: {
    UPLOAD: "/api/documents/upload",
    GET_DOCUMENTS: "/api/documents",
    GET_DOCUMENT_BY_ID: (id) => `/api/documents/${id}`,
    UPDATE_DOCUMENT: (id) => `/api/documents/${id}`,
    DELETE_DOCUMENT: (id) => `/api/documents/${id}`,
  },

  // ================= AI =================
  AI: {
    GENERATE_FLASHCARDS: "/api/ai/generate-flashcards",
    GENERATE_QUIZ: "/api/ai/generate-quiz",
    GENERATE_SUMMARY: "/api/ai/generate-summary",
    CHAT: "/api/ai/chat",
    EXPLAIN_CONCEPT: "/api/ai/explain-concept",
    GET_CHAT_HISTORY: (documentId) => `/api/ai/chat-history/${documentId}`,
  },

  // ================= FLASHCARDS =================
  FLASHCARDS: {
    GET_ALL_FLASHCARD_SETS: "/api/flashcards",
    GET_FLASHCARDS_FOR_DOC: (documentId) => `/api/flashcards/${documentId}`,
    REVIEW_FLASHCARD: (cardId) => `/api/flashcards/${cardId}/review`,
    TOGGLE_STAR: (cardId) => `/api/flashcards/${cardId}/star`,
    DELETE_FLASHCARD_SET: (id) => `/api/flashcards/${id}`,
    // STATIC
    DOWNLOAD_FLASHCARD_TEMPLATE: "/api/flashcards/template",
    PREVIEW_FLASHCARD_FROM_SHEET: "/api/flashcards/preview",
    CONFIRM_FLASHCARD_FROM_SHEET: "/api/flashcards/confirm",
    CREATE_MANUAL_FLASHCARD: "/api/flashcards/manual",
  },

  // ================= QUIZZES =================
  QUIZZES: {
  // 📥 GET
  GET_ALL_QUIZZES: "/api/quizzes",
  GET_QUIZZES_FOR_DOC: (documentId) => `/api/quizzes/document/${documentId}`,
  GET_QUIZ_BY_ID: (id) => `/api/quizzes/${id}`,

  // 🚀 ACTIONS
  START_QUIZ: (id) => `/api/quizzes/${id}/start`,
  SUBMIT_QUIZ: (id) => `/api/quizzes/${id}/submit`,
  GET_QUIZ_RESULTS: (id) => `/api/quizzes/${id}/results`,
  RESTART_QUIZ: (id) => `/api/quizzes/${id}/restart`,

  // 🗑️ DELETE
  DELETE_QUIZ: (id) => `/api/quizzes/${id}`,

  // ✍️ CREATE
  CREATE_MANUAL_QUIZ: "/api/quizzes/manual",

  // 📊 SHEET FLOW (rất quan trọng – tránh conflict)
  PREVIEW_QUIZ_FROM_SHEET: "/api/quizzes/preview",
  CONFIRM_QUIZ_FROM_SHEET: "/api/quizzes/confirm",
  DOWNLOAD_QUIZ_TEMPLATE: "/api/quizzes/download-template",
},

  // ================= PROGRESS / DASHBOARD =================
  PROGRESS: {
    GET_DASHBOARD: "/api/progress/dashboard",
  },
};

export default API_PATHS;
