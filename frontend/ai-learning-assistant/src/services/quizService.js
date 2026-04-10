import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
/* =========================
   QUIZ SERVICES
========================= */

/* ---------- GET QUIZZES FOR A DOCUMENT ---------- */
export const getQuizzesByDocument = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.QUIZZES.GET_QUIZZES_FOR_DOC(documentId),
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch quizzes",
      }
    );
  }
};

/* ---------- GET QUIZ BY ID ---------- */
export const getQuizById = async (quizId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.QUIZZES.GET_QUIZ_BY_ID(quizId),
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch quiz",
      }
    );
  }
};

/* ---------- SUBMIT QUIZ ---------- */
/**
 * answers format:
 * [
 *   { questionIndex: 0, selectedAnswer: 2 },
 *   { questionIndex: 1, selectedAnswer: 0 }
 * ]
 */
export const submitQuiz = async (quizId, answers) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.QUIZZES.SUBMIT_QUIZ(quizId),
      { answers },
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to submit quiz",
      }
    );
  }
};

/* ---------- GET QUIZ RESULTS ---------- */
export const getQuizResults = async (quizId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.QUIZZES.GET_QUIZ_RESULTS(quizId),
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch quiz results",
      }
    );
  }
};

/* ---------- DELETE QUIZ ---------- */
export const deleteQuiz = async (quizId) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.QUIZZES.DELETE_QUIZ(quizId),
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to delete quiz",
      }
    );
  }
};

/* ---------- RESTART / REMAKE QUIZ ---------- */
export const restartQuiz = async (quizId) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.QUIZZES.RESTART_QUIZ(quizId),
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to restart quiz",
      }
    );
  }
};
/* ---------- START QUIZ ---------- */
export const startQuiz = async (quizId) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.QUIZZES.START_QUIZ(quizId),
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to start quiz",
      }
    );
  }
};

export const getAllQuizzes = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_ALL_QUIZZES);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch quizzes" };
  }
};

export const createManualQuiz = async (data) => {
  try {
    const response = await axiosInstance.post(API_PATHS.QUIZZES.CREATE_MANUAL_QUIZ, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "createManualQuiz failed" };
  }
};

export const previewQuizFromSheet = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosInstance.post(API_PATHS.QUIZZES.PREVIEW_QUIZ_FROM_SHEET, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "previewQuizFromSheet failed" };
  }
};

export const confirmQuizFromSheet = async (data) => {
  try {
    const res = await axiosInstance.post(API_PATHS.QUIZZES.CONFIRM_QUIZ_FROM_SHEET, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "confirmQuizFromSheet failed" };
  }
};

export const downloadQuizTemplate = async () => {
  try {
    const res = await axiosInstance.get(API_PATHS.QUIZZES.DOWNLOAD_QUIZ_TEMPLATE, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "quiz_template.xlsx");
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    throw error.response?.data || { message: "downloadQuizTemplate failed" };
  }
};
const quizService = {
  getQuizzesByDocument,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
  restartQuiz,
  startQuiz,
  getAllQuizzes,
  createManualQuiz,
  previewQuizFromSheet,
  confirmQuizFromSheet,
  downloadQuizTemplate,
};

export default quizService;
