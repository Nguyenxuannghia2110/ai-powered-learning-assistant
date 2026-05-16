import { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import { Search, ShieldAlert, ShieldCheck, Lock, Unlock, Eye, X, FileText, BookOpen, Layers } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers(page, 10, search);
      if (res.success) {
        setUsers(res.data);
        setTotalPages(res.pagination.pages);
        setTotalUsers(res.pagination.total);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, page]);

  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "banned" : "active";
    try {
      const res = await adminService.updateUserStatus(userId, newStatus);
      if (res.success) {
        toast.success(`User is now ${newStatus}`);
        setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.success) {
        toast.success(`User role changed to ${newRole}`);
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update role");
    }
  };

  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setLoadingStats(true);
    try {
      const res = await adminService.getUserById(user._id);
      if (res.success) {
        setUserStats(res.data.stats);
      }
    } catch (error) {
      toast.error("Failed to fetch user stats");
    } finally {
      setLoadingStats(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setUserStats(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">User Management</h1>
          <p className="text-body mt-1">Total {totalUsers} users registered on the platform.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
          <input
            type="text"
            placeholder="Search by email or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-canvas-soft border border-hairline rounded-md text-sm text-ink placeholder-mute focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-canvas-soft border border-hairline rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-canvas border-b border-hairline text-mute">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-mute">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-mute">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-canvas/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-ink">{user.username}</span>
                        <span className="text-mute text-xs">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium uppercase tracking-wider border ${
                        user.role === "admin" 
                          ? "bg-red-500/10 text-red-500 border-red-500/20" 
                          : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium border ${
                        user.status === "active"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                      }`}>
                        {user.status === "active" ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-mute">
                      {format(new Date(user.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="p-1.5 text-mute hover:text-primary hover:bg-primary/10 rounded-md border border-transparent hover:border-primary/20 transition-colors"
                          title="View User Stats"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRoleChange(user._id, user.role)}
                          className="p-1.5 text-mute hover:text-ink hover:bg-canvas rounded-md border border-transparent hover:border-hairline transition-colors"
                          title={`Toggle Role (Current: ${user.role})`}
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(user._id, user.status)}
                          className={`p-1.5 rounded-md border border-transparent transition-colors ${
                            user.status === "active" 
                              ? "text-mute hover:text-orange-500 hover:bg-orange-500/10 hover:border-orange-500/20" 
                              : "text-orange-500 hover:text-green-500 hover:bg-green-500/10 hover:border-green-500/20"
                          }`}
                          title={`Toggle Status (Current: ${user.status})`}
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-hairline flex items-center justify-between">
            <span className="text-sm text-mute">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 text-sm bg-canvas border border-hairline rounded-md disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-sm bg-canvas border border-hairline rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-canvas border border-hairline rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-1.5 text-mute hover:text-ink hover:bg-canvas-soft rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-ink mb-1">User Details</h2>
            <p className="text-sm text-mute mb-6">{selectedUser?.email}</p>

            {loadingStats ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-canvas-soft border border-hairline rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-md">
                      <FileText className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="text-body font-medium">Documents</span>
                  </div>
                  <span className="text-xl font-bold text-ink">{userStats?.documents || 0}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-canvas-soft border border-hairline rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-body font-medium">Quizzes</span>
                  </div>
                  <span className="text-xl font-bold text-ink">{userStats?.quizzes || 0}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-canvas-soft border border-hairline rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500/10 rounded-md">
                      <Layers className="w-5 h-5 text-pink-500" />
                    </div>
                    <span className="text-body font-medium">Flashcards</span>
                  </div>
                  <span className="text-xl font-bold text-ink">{userStats?.flashcards || 0}</span>
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-hairline flex justify-end">
              <button 
                onClick={closeModal}
                className="px-4 py-2 bg-canvas-soft hover:bg-hairline text-ink rounded-md text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
