import { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import { Trash2, FileText, BookOpen, PlaySquare } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function AdminContentPage() {
  const [content, setContent] = useState({ documents: [], quizzes: [], workspaces: [] });
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await adminService.getRecentContent(20);
      if (res.success) {
        setContent(res.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;

    try {
      const res = await adminService.deleteContent(type, id);
      if (res.success) {
        toast.success(`${type} deleted successfully.`);
        // Remove from UI
        setContent((prev) => ({
          ...prev,
          [`${type}s`]: prev[`${type}s`].filter((item) => item._id !== id)
        }));
      }
    } catch (error) {
      toast.error("Failed to delete content.");
      console.error(error);
    }
  };

  const renderTable = (items, type, icon, title) => (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-ink flex items-center gap-2 mb-4">
        {icon} {title}
      </h2>
      <div className="bg-canvas-soft border border-hairline rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-canvas border-b border-hairline text-mute">
              <tr>
                <th className="px-6 py-4 font-medium">Title/Name</th>
                <th className="px-6 py-4 font-medium">Created By</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-mute">No {type}s found.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-canvas/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-ink truncate max-w-[200px] block">
                        {item.title || item.name || item.fileName || "Untitled"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-mute">{item.userId?.username || item.userId?.email || "Unknown User"}</span>
                    </td>
                    <td className="px-6 py-4 text-mute">
                      {format(new Date(item.createdAt || item.uploadDate || Date.now()), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(type, item._id)}
                        className="p-1.5 text-mute hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                        title={`Delete ${type}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-ink">Content Moderation</h1>
        <p className="text-body mt-1">Review and manage platform content. You can permanently delete violating or spam content.</p>
      </div>

      {renderTable(content.documents, "document", <FileText className="w-5 h-5 text-orange-400" />, "Recent Documents")}
      {renderTable(content.quizzes, "quiz", <BookOpen className="w-5 h-5 text-primary" />, "Recent Quizzes")}
      {renderTable(content.workspaces, "workspace", <PlaySquare className="w-5 h-5 text-purple-400" />, "Recent Workspaces")}
    </div>
  );
}
