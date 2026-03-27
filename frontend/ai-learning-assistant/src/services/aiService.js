import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";


/* ---------- FLASHCARDS ---------- */
export const generateFlashcards = async (documentId, options) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_FLASHCARDS,
      {
        documentId,
        ...options,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to generate flashcards",
    };
  }
};

/* ---------- QUIZ ---------- */
export const generateQuiz = async (documentId, options ) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_QUIZ,
      {
        documentId,
        ...options,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to generate quiz",
    };
  }
};

/* ---------- SUMMARY ---------- */
export const generateSummary = async (documentId) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_SUMMARY,
      {
        documentId,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to generate summary",
    };
  }
};

/* ---------- CHAT WITH DOCUMENT ---------- */
export const chat = async (documentId, message) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.CHAT,
      {
        documentId,
        question,
        message,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to chat with document",
    };
  }
};

/* ---------- EXPLAIN CONCEPT ---------- */
export const explainConcept = async (documentId, concept) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.EXPLAIN_CONCEPT,
      {
        documentId,
        concept,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to explain concept",
    };
  }
};

/* ---------- CHAT HISTORY ---------- */
export const getChatHistory = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.AI.GET_CHAT_HISTORY(documentId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Failed to get chat history",
    };
  }
};

const aiService = {
    generateFlashcards,
    generateQuiz,
    generateSummary,
    chat,
    explainConcept,
    getChatHistory,
};