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
const quizService = {
  getQuizzesByDocument,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
  restartQuiz,
  startQuiz,
};

export default quizService;
