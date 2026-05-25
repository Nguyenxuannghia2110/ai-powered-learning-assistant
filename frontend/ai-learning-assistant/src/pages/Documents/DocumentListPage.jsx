import React, { useMemo, useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { Search, Grid, List, Upload, X, Trash2 } from "lucide-react";
import DocumentCard from "../../components/documents/DocumentCard";
import API_PATHS from "../../utils/apiPaths";
import { createPortal } from "react-dom";

/* ================= DocumentListPage ================= */

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [title, setTitle] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [docToDelete, setDocToDelete] = useState(null);

  /* ================= FETCH DOCUMENTS ================= */
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENTS);

        const mappedDocs = res.data.data.map((doc) => ({
          ...doc,
          size: `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`,
          flashcards: doc.flashcardsCount ?? 0,
          quizzes: doc.quizzesCount ?? 0,
          timestamp: new Date(doc.uploadDate || doc.createdAt).toLocaleString(),
        }));

        setDocuments(mappedDocs);
      } catch (err) {
        console.error("Failed to fetch documents:", err);
        toast.error("Cannot load documents");
      }
    };
    fetchDocuments();
  }, []);

  /* ================= FILTER ================= */
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) =>
      doc.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [documents, search]);

  /* ================= UPLOAD ================= */
  const validateAndSetFile = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf")
      return toast.error("Only PDF files are allowed");
    if (file.size > 10 * 1024 * 1024)
      return toast.error("PDF must be under 10MB");
    setUploadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleUpload = async () => {
    if (!title.trim()) return toast.error("Please enter document title");
    if (!uploadFile) return toast.error("Please select a PDF file");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", uploadFile);

    try {
      setUploading(true);

      const res = await axiosInstance.post(
        API_PATHS.DOCUMENTS.UPLOAD,
        formData,
      );

      // ✅ Tin hoàn toàn BE
      setDocuments((prev) => [res.data.data, ...prev]);

      toast.success("Document uploaded successfully");
      setUploadOpen(false);
      setTitle("");
      setUploadFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(
        API_PATHS.DOCUMENTS.DELETE_DOCUMENT(docToDelete._id),
      );
      setDocuments((prev) => prev.filter((doc) => doc._id !== docToDelete._id));
      toast.success("Document deleted");
      setDocToDelete(null);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed");
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="space-y-8 text-ink">
      {/* HEADER */}
      <div className="space-y-6">
        {/* ROW 1 */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ink">Document Library</h1>

            <p className="text-body text-sm mt-1">
              Central hub for your learning materials and AI-generated insights.
            </p>
          </div>

          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2
      bg-primary hover:bg-emerald-600
      text-black font-semibold
      px-6 py-3 rounded-xl
      shadow-lg shadow-[0_8px_8px_rgba(0,0,0,0.3)] transition"
          >
            <Upload size={18} />
            Upload New Document
          </button>
        </div>

        {/* ROW 2 */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* LEFT TABS */}
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl bg-primary/20 text-primary border border-primary/30">
              All Files
            </button>

            <button className="px-4 py-2 rounded-xl bg-canvas-card text-body border border-hairline hover:bg-white/10">
              Recently Added
            </button>
          </div>

          {/* RIGHT CONTROLS */}
          <div className="flex items-center gap-3">
            {/* SEARCH */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-body"
              />

              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-56
          rounded-xl
          bg-canvas-card
          border border-hairline
          text-sm text-ink
          placeholder-gray-400
          focus:outline-none
          focus:ring-2
          focus:ring-emerald-500/30"
              />
            </div>

            {/* SORT */}
            <select
              className="px-3 py-2 rounded-xl
        bg-canvas-card
        border border-hairline
        text-sm text-body
        focus:outline-none"
            >
              <option>Sort by</option>
              <option>Name</option>
              <option>Date</option>
            </select>

            {/* GRID / LIST */}
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-xl border border-hairline
        ${view === "grid" ? "bg-primary/20 text-primary" : "bg-canvas-card text-body"}
        `}
            >
              <Grid size={18} />
            </button>

            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-xl border border-hairline
        ${view === "list" ? "bg-primary/20 text-primary" : "bg-canvas-card text-body"}
        `}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* DOCUMENT LIST */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-20 text-body">
          No documents found
        </div>
      ) : (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc._id}
              doc={doc}
              onDeleteRequest={setDocToDelete}
            />
          ))}
        </div>
      )}

      {/*UpLoad Model */}
      {uploadOpen &&
        createPortal(
          <div
            className="
      fixed inset-0
      z-[9999]
      flex items-center justify-center
      p-6
      bg-black/60
      backdrop-blur-md
      "
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="
        w-full max-w-2xl
        max-h-[85vh]
        overflow-y-auto
        rounded-md
        bg-canvas-card
        border border-hairline
        shadow-2xl
        p-8
        space-y-6
        text-ink
        "
            >
              {/* HEADER */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Upload New Document</h2>

                <button
                  onClick={() => setUploadOpen(false)}
                  className="text-body hover:text-ink"
                >
                  <X size={20} />
                </button>
              </div>

              <hr className="border-hairline" />

              {/* TILE */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-body">
                  Document Name
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Biology Chapter 4: Photosynthesis"
                  className="w-full
          px-5 py-4
          rounded-xl
          bg-black/40
          border border-hairline
          placeholder-gray-500
          focus:outline-none
          focus:ring-2
          focus:ring-emerald-500/30"
                />
              </div>

              {/* FILE DROP */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("fileInput").click()}
                className={`
        border-2 border-dashed
        rounded-xl
        p-10
        text-center
        cursor-pointer
        transition
        ${dragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300"}
        `}
              >
                <Upload className="mx-auto text-indigo-500 mb-3" size={32} />

                <p className="font-medium">Click to upload or drag and drop</p>

                <p className="text-sm text-body">PDF up to 10MB</p>

                {uploadFile && (
                  <p className="mt-3 text-sm font-semibold text-indigo-600">
                    {uploadFile.name}
                  </p>
                )}

                <input
                  id="fileInput"
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => validateAndSetFile(e.target.files[0])}
                />
              </div>

              {/* FOOTER */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setUploadOpen(false)}
                  className="flex-1
          py-3
          rounded-xl
          bg-black
          border border-hairline
          hover:bg-canvas-card
          transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`flex-1
          py-3
          rounded-xl
          font-semibold
          flex items-center justify-center gap-2
${
  uploading ? "bg-gray-600" : "bg-primary hover:bg-emerald-600 text-black"
}`}
                >
                  <Upload size={18} />
                  {uploading ? "Uploading..." : "Upload & Analyze"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* DELETE MODAL */}
      {docToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-lg text-gray-900">
              Delete document?
            </h3>
            <p className="text-sm text-mute">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{docToDelete.title}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDocToDelete(null)}
                className="px-4 py-2 rounded-xl border"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 text-ink flex items-center gap-2"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentListPage;
