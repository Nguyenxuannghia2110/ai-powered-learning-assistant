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

/* ---------- PREVIEW FROM SHEET ---------- */
export const previewFlashcardFromSheet = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axiosInstance.post(
      API_PATHS.FLASHCARDS.PREVIEW_FLASHCARD_FROM_SHEET,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "previewFlashcardFromSheet failed",
      }
    );
  }
};

/* ---------- CONFIRM FROM SHEET ---------- */
export const confirmFlashcardFromSheet = async (data) => {
  try {
    const res = await axiosInstance.post(
      API_PATHS.FLASHCARDS.CONFIRM_FLASHCARD_FROM_SHEET,
      data,
    );
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "confirmFlashcardFromSheet failed",
      }
    );
  }
};

/* ---------- DOWNLOAD TEMPLATE ---------- */
export const downloadFlashcardTemplate = async () => {
  try {
    const res = await axiosInstance.get(
      API_PATHS.FLASHCARDS.DOWNLOAD_FLASHCARD_TEMPLATE,
      {
        responseType: "blob",
      },
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "flashcard_template.xlsx");
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    throw (
      error.response?.data || {
        message: "downloadFlashcardTemplate failed",
      }
    );
  }
};

/* ---------- CREATE MANUAL ---------- */
export const createManualFlashcard = async (data) => {
  try {
    const res = await axiosInstance.post(
      API_PATHS.FLASHCARDS.CREATE_MANUAL_FLASHCARD,
      data,
    );
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "createManualFlashcard failed",
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
  createManualFlashcard,
  downloadFlashcardTemplate,
  confirmFlashcardFromSheet,
  previewFlashcardFromSheet,
};

export default flashcardService;
