import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";

const getWorkspaces = async () => {
  const response = await axiosInstance.get(API_PATHS.WORKSPACES.GET_ALL);
  return response.data;
};

const createWorkspace = async (workspaceData) => {
  const response = await axiosInstance.post(API_PATHS.WORKSPACES.CREATE, workspaceData);
  return response.data;
};

const getWorkspaceById = async (id) => {
  const response = await axiosInstance.get(API_PATHS.WORKSPACES.GET_BY_ID(id));
  return response.data;
};

const updateWorkspace = async (id, workspaceData) => {
  const response = await axiosInstance.put(API_PATHS.WORKSPACES.UPDATE(id), workspaceData);
  return response.data;
};

const deleteWorkspace = async (id) => {
  const response = await axiosInstance.delete(API_PATHS.WORKSPACES.DELETE(id));
  return response.data;
};

const generateNodeLesson = async (workspaceId, nodeId) => {
  const response = await axiosInstance.post(
    API_PATHS.WORKSPACES.GENERATE_NODE_LESSON(workspaceId, nodeId),
    {}
  );
  return response.data;
};

const generateNodeFlashcards = async (workspaceId, nodeId) => {
  const response = await axiosInstance.post(
    API_PATHS.WORKSPACES.GENERATE_NODE_FLASHCARDS(workspaceId, nodeId),
    {}
  );
  return response.data;
};

const generateNodeQuiz = async (workspaceId, nodeId) => {
  const response = await axiosInstance.post(
    API_PATHS.WORKSPACES.GENERATE_NODE_QUIZ(workspaceId, nodeId),
    {}
  );
  return response.data;
};

const getNodeLesson = async (workspaceId, nodeId) => {
  const response = await axiosInstance.get(
    API_PATHS.WORKSPACES.GET_NODE_LESSON(workspaceId, nodeId)
  );
  return response.data;
};

const completeNode = async (workspaceId, nodeId, data = {}) => {
  const response = await axiosInstance.post(
    API_PATHS.WORKSPACES.COMPLETE_NODE(workspaceId, nodeId),
    data
  );
  return response.data;
};

const resetWorkspaceProgress = async (workspaceId) => {
  const response = await axiosInstance.post(
    API_PATHS.WORKSPACES.RESET_PROGRESS(workspaceId),
    {}
  );
  return response.data;
};

const workspaceService = {
  getWorkspaces,
  createWorkspace,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  generateNodeLesson,
  generateNodeFlashcards,
  generateNodeQuiz,
  getNodeLesson,
  completeNode,
  resetWorkspaceProgress,
};

export default workspaceService;
