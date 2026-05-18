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
      className="bg-canvas-card rounded-md p-6 hover:bg-canvas-mid shadow-[0_8px_8px_rgba(0,0,0,0.3)] transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
    >
      <div className="relative z-10 flex flex-col h-full">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <FileText className="w-6 h-6" />
          </div>
          <div className="px-3 py-1 bg-canvas-mid rounded-pill text-[12px] font-bold text-body uppercase tracking-[1.4px]">
            {doc.status}
          </div>
        </div>

        {/* TITLE */}
        <h3 className="text-[18px] font-bold text-ink mb-2 group-hover:text-primary transition-colors line-clamp-2" title={doc.title}>
          {doc.title}
        </h3>

        {/* DETAILS */}
        <p className="text-body text-sm mb-6 flex items-start gap-2 line-clamp-2">
          {(doc.fileSize / 1024).toFixed(1)} KB • {doc.flashcardCount ?? 0} Flashcards • {doc.quizCount ?? 0} Quizzes
        </p>

        {/* FOOTER */}
        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between pt-4 border-t border-hairline">
            <div className="flex items-center gap-2 text-[12px] text-mute">
              Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRequest(doc);
                }}
                className="w-8 h-8 rounded-full bg-canvas-mid flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors text-mute"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
