import { useState, useEffect, useCallback } from "react";
import { adminService } from "../services/api";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  KeyRound,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

const emptyUserForm = {
  username: "",
  email: "",
  password: "",
  role: "user",
  status: "active",
  subscription: "Free",
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
    subscription: "all",
  });

  // Modal states (To be implemented fully in separate components)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState(emptyUserForm);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      if (res.data.success) {
        setUsers(res.data.data.users);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      toast.error("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.page]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      // Basic client-side validation to avoid creating duplicate users
      const trimmedEmail = formData.email?.trim().toLowerCase();
      const trimmedUsername = formData.username?.trim();
      const emailExists = users.some(
        (u) => u.email && u.email.toLowerCase() === trimmedEmail,
      );
      const usernameExists = users.some(
        (u) => u.username && u.username === trimmedUsername,
      );

      if (!selectedUser) {
        if (emailExists || usernameExists) {
          const field = emailExists ? "email" : "username";
          toast.error(`A user with this ${field} already exists`);
          return;
        }
      } else {
        // When editing, allow same email/username for the selected user but prevent duplicates with others
        const otherEmailExists = users.some(
          (u) =>
            u._id !== selectedUser._id &&
            u.email &&
            u.email.toLowerCase() === trimmedEmail,
        );
        const otherUsernameExists = users.some(
          (u) =>
            u._id !== selectedUser._id &&
            u.username &&
            u.username === trimmedUsername,
        );
        if (otherEmailExists || otherUsernameExists) {
          const field = otherEmailExists ? "email" : "username";
          toast.error(`Another user with this ${field} already exists`);
          return;
        }
      }

      if (selectedUser) {
        const updatePayload = { ...formData };
        // normalize fields
        updatePayload.username = trimmedUsername;
        updatePayload.email = trimmedEmail;
        if (!updatePayload.password) {
          delete updatePayload.password;
        }

        await adminService.updateUser(selectedUser._id, updatePayload);
        toast.success("User updated successfully");
      } else {
        const payload = {
          ...formData,
          username: trimmedUsername,
          email: trimmedEmail,
        };
        await adminService.createUser(payload);
        toast.success("User created successfully");
      }
      setIsModalOpen(false);
      setSelectedUser(null);
      setFormData(emptyUserForm);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save user");
    }
  };

  const handleCreateClick = () => {
    setSelectedUser(null);
    setFormData(emptyUserForm);
    setIsModalOpen(true);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      subscription: user.subscription || "Free",
      password: "",
    });
    setIsModalOpen(true);
  };

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminService.deleteUser(id);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (err) {
        toast.error(err.response?.data?.message || "Delete failed");
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">
            User Management
          </h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Manage your {pagination.total} platform users, roles, and
            subscriptions.
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          className="bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--primary)]/90 transition-all shadow-md flex items-center gap-2"
        >
          <Plus size={18} />
          Create User
        </button>
      </div>

      {/* Filters & Search */}
      <div className="glass rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            placeholder="Search username or email..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] focus:border-[var(--primary)] text-sm rounded-xl py-2.5 pl-10 pr-4 outline-none transition-all text-[var(--text-main)]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] text-sm rounded-xl px-4 py-2.5 outline-none focus:border-[var(--primary)]"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] text-sm rounded-xl px-4 py-2.5 outline-none focus:border-[var(--primary)]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>

          <select
            value={filters.subscription}
            onChange={(e) => handleFilterChange("subscription", e.target.value)}
            className="bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] text-sm rounded-xl px-4 py-2.5 outline-none focus:border-[var(--primary)]"
          >
            <option value="all">All Plans</option>
            <option value="Free">Free</option>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden border border-[var(--border-subtle)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-hover)]/50">
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-[var(--text-muted)]"
                  >
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-[var(--text-muted)]"
                  >
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={user._id}
                    className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
                          {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-main)]">
                            {user.username || 'Unknown User'}
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-500/10 text-purple-500"
                            : "bg-slate-500/10 text-slate-500"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === "active"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {user.status === "active" ? (
                          <CheckCircle size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-[var(--text-main)] border border-[var(--border-subtle)] px-2 py-1 rounded-md bg-[var(--bg-card)]">
                        {user.subscription || "Free"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            const newPass = prompt(
                              "Enter new password (min 6 chars):",
                            );
                            if (newPass && newPass.length >= 6) {
                              adminService
                                .resetUserPassword(user._id, newPass)
                                .then(() => toast.success("Password reset"))
                                .catch((err) =>
                                  toast.error(
                                    err.response?.data?.message || "Error",
                                  ),
                                );
                            }
                          }}
                          className="p-2 text-[var(--text-muted)] hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button
                          className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                          onClick={() => handleDelete(user._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && users.length > 0 && (
          <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-card)]">
            <span className="text-sm text-[var(--text-muted)]">
              Showing{" "}
              <span className="font-medium text-[var(--text-main)]">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-[var(--text-main)]">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-[var(--text-main)]">
                {pagination.total}
              </span>{" "}
              users
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-medium text-[var(--text-main)] px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-card)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-[var(--border-subtle)]"
          >
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[var(--text-main)]">
                {selectedUser ? "Edit User" : "Create New User"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  Username
                </label>
                <input
                  required
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
                />
              </div>
              {!selectedUser && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                    Password
                    <span className="text-xs text-[var(--text-muted)] ml-2 font-normal">(Min 6 chars, letters & numbers)</span>
                  </label>
                  <input
                    required
                    minLength={6}
                    type="text"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
                  >
                    <option value="active">Active</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  Subscription
                </label>
                <select
                  value={formData.subscription}
                  onChange={(e) =>
                    setFormData({ ...formData, subscription: e.target.value })
                  }
                  className="w-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
                >
                  <option value="Free">Free</option>
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[var(--primary)] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--primary)]/90 transition-colors"
                >
                  {selectedUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
