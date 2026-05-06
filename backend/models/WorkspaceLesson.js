import mongoose from "mongoose";

const workspaceLessonSchema =
  new mongoose.Schema(
    {
      workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
      },

      nodeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },

      title: {
        type: String,
        required: true,
      },

      content: {
        type: String,
        required: true,
      },

      summary: String,
    },
    {
      timestamps: true,
    }
  );

const WorkspaceLesson = mongoose.model(
  "WorkspaceLesson",
  workspaceLessonSchema
);

export default WorkspaceLesson;