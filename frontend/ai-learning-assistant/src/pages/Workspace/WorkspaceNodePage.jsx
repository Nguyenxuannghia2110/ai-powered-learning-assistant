import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Layers,
  HelpCircle,
  PlayCircle,
  Brain,
  Star,
  RefreshCw,
} from "lucide-react";
import workspaceService from "../../services/workspaceService";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";

export default function WorkspaceNodePage() {
  const { id, nodeId } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [node, setNode] = useState(null);
  const [lessonContent, setLessonContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id, nodeId]);

  const fetchData = async () => {
    try {
      const response = await workspaceService.getWorkspaceById(id);
      const ws = response.data;
      setWorkspace(ws);
      const currentNode = ws.nodes.find((n) => n._id === nodeId);
      setNode(currentNode);

      if (currentNode && currentNode.isGenerated) {
        fetchLesson();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load node");
      navigate(`/workspaces/${id}`);
    }
  };

  const fetchLesson = async () => {
    try {
      const response = await workspaceService.getNodeLesson(id, nodeId);
      setLessonContent(response.data.content);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      // Don't toast error here, maybe it's not a lesson node
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerationStep("lesson");
    try {
      await workspaceService.generateNodeLesson(id, nodeId);
      
      setGenerationStep("flashcards");
      await workspaceService.generateNodeFlashcards(id, nodeId);
      
      setGenerationStep("quiz");
      await workspaceService.generateNodeQuiz(id, nodeId);
      
      toast.success("Content generated successfully!");
      fetchData(); // Reload node data and fetch lesson
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(error.response?.data?.error || "Failed to generate content");
    } finally {
      setGenerating(false);
      setGenerationStep(null);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await workspaceService.completeNode(id, nodeId);
      toast.success("Step completed!");
      navigate(`/workspaces/${id}`);
    } catch (error) {
      console.error("Error completing step:", error);
      toast.error("Failed to complete step");
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!node) return null;

  const isCompleted = node.status === "completed";
  const flashcardResource = node.resources?.find((r) => r.type === "flashcard");
  const quizResource = node.resources?.find((r) => r.type === "quiz");

  return (
    <div className="p-8 max-w-4xl mx-auto pb-32">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/workspaces/${id}`)}
        className="flex items-center gap-2 text-body hover:text-ink mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Roadmap
      </button>

      {/* Node Header */}
      <div className="bg-canvas-card border border-hairline rounded-md p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 bg-canvas-card border border-hairline rounded-full text-xs font-semibold text-body uppercase tracking-wide">
              Step {node.order} • {node.type}
            </span>
            {isCompleted && (
              <span className="flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/20">
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-ink mb-4">{node.title}</h1>
          <p className="text-body max-w-3xl">{node.description}</p>
        </div>
      </div>

      {/* Content Section */}
      {!node.isGenerated ? (
        <div className="bg-canvas-card border border-hairline rounded-md p-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-ink mb-4">Ready to Learn?</h2>
          <p className="text-body mb-8 max-w-lg mx-auto">
            Our AI will generate a personalized lesson, interactive flashcards, and a quiz based on this step's objectives.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-3 px-8 py-4 bg-primary hover:opacity-80 text-black font-bold rounded-full transition-all mx-auto shadow-lg shadow-[0_8px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_8px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {generating ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                {generationStep === "lesson" && "Generating Lesson..."}
                {generationStep === "flashcards" && "Generating Flashcards..."}
                {generationStep === "quiz" && "Generating Quiz..."}
                {!generationStep && "Generating Content..."}
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Generate Learning Material
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Lesson Content */}
          {lessonContent && (
            <div className="bg-canvas-card border border-hairline rounded-md p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="markdown-lesson">
                <ReactMarkdown>{lessonContent}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Action Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flashcardResource && (
              <button
                onClick={() => navigate(`/flashcards`)} // Need a way to select specific set, but navigating to flashcards page is ok for now
                className="flex items-center gap-4 py-4 px-8 bg-canvas-card border border-hairline rounded-full hover:bg-canvas-mid hover:border-hairline transition-all text-left group"
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">Review Flashcards</h3>
                  <p className="text-sm text-body">Master key concepts</p>
                </div>
              </button>
            )}

            {quizResource && (
              <button
                onClick={() => navigate(`/quizzes/${quizResource.resourceId}`)}
                className="flex items-center gap-4 py-4 px-8 bg-canvas-card border border-hairline rounded-full hover:bg-canvas-mid hover:border-hairline transition-all text-left group"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">Take Quiz</h3>
                  <p className="text-sm text-body">Test your knowledge</p>
                </div>
              </button>
            )}
          </div>

          {/* Complete Button Fixed at Bottom */}
          <div className="flex justify-center mt-12 pt-8 border-t border-hairline">
            <button
              onClick={handleComplete}
              disabled={isCompleted || completing}
              className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all ${
                isCompleted
                  ? "bg-primary/20 text-primary cursor-not-allowed border border-primary/20"
                  : "bg-primary hover:opacity-80 text-black shadow-lg shadow-[0_8px_8px_rgba(0,0,0,0.3)]"
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  Step Completed
                </>
              ) : completing ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <Star className="w-6 h-6" />
                  Mark as Complete (+{node.xpReward} XP)
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
