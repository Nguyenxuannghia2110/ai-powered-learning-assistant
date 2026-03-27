import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

/* =========================
   FLASHCARD SERVICES
========================= */

/* ---------- GET ALL FLASHCARD SETS ---------- */
export const getAllFlashcardSets = async () => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.FLASHCARDS.GET_ALL_FLASHCARD_SETS,
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch flashcard sets",
      }
    );
  }
};

/* ---------- GET FLASHCARDS FOR A DOCUMENT ---------- */
export const getFlashcardsByDocument = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(documentId),
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch flashcards",
      }
    );
  }
};

/* ---------- REVIEW FLASHCARD ---------- */
export const reviewFlashcard = async (cardId) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.FLASHCARDS.REVIEW_FLASHCARD(cardId),
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to review flashcard",
      }
    );
  }
};

/* ---------- TOGGLE STAR FLASHCARD ---------- */
export const toggleStar = async (cardId) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.FLASHCARDS.TOGGLE_STAR(cardId),
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to toggle star flashcard",
      }
    );
  }
};

/* ---------- DELETE FLASHCARD SET ---------- */
export const deleteFlashcardSet = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.FLASHCARDS.DELETE_FLASHCARD_SET(id),
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to delete flashcard set",
      }
    );
  }
};

const flashcardService = {
  getAllFlashcardSets,
  getFlashcardsByDocument,
  reviewFlashcard,
  toggleStar,
  deleteFlashcardSet,
};

export default flashcardService;
