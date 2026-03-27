import { FileText, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DocumentCard = ({ doc, onDeleteRequest }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/documents/${doc._id}`);
  };

  return (
    <div
      onClick={handleNavigate}
      className="
      relative
      bg-[#0b0f0e]
      border border-white/10
      rounded-2xl
      p-6
      space-y-5
      hover:border-emerald-400/40
      hover:shadow-lg hover:shadow-emerald-500/5
      transition
      cursor-pointer
      "
    >
      {/* ICON + STATUS */}
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <FileText className="text-emerald-400" size={22} />
        </div>

        <span
          className={`text-xs px-2.5 py-1 rounded-full font-semibold
          ${
            doc.status === "ready"
              ? "bg-emerald-500/10 text-emerald-400"
              : doc.status === "processing"
                ? "bg-yellow-500/10 text-yellow-400"
                : "bg-red-500/10 text-red-400"
          }`}
        >
          {doc.status}
        </span>
      </div>

      {/* TITLE */}
      <div>
        <h3 className="font-semibold text-white truncate" title={doc.title}>
          {doc.title}
        </h3>

        <p className="text-xs text-gray-500">
          {(doc.fileSize / 1024).toFixed(1)} KB
        </p>
      </div>

      {/* COUNTS */}
      <div className="flex gap-4 text-xs font-semibold">
        <span className="text-purple-400">
          {doc.flashcardCount ?? 0} Flashcards
        </span>

        <span className="text-emerald-400">{doc.quizCount ?? 0} Quizzes</span>
      </div>

      {/* DATE */}
      <div className="text-xs text-gray-500">
        Uploaded {new Date(doc.uploadDate).toLocaleString("vi-VN")}
      </div>

      {/* ACTION */}
      <div className="flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteRequest(doc);
          }}
          className="
          text-red-400
          hover:text-red-500
          transition
          "
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
