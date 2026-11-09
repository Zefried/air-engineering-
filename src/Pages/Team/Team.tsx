import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Shield,
  Wrench,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  RefreshCw,
  KeyRound,
  Phone,
  Mail,
  User as UserIcon
} from 'lucide-react';
import './Styles/Team.css';
import { usersApi } from '../../api/usersApi';
import type { UserItem, UserPayload } from '../../api/usersApi';
import Pagination from '../../Components/Pagination/Pagination';

const FALLBACK_USERS: UserItem[] = [
  {
    id: 1,
    name: "System Admin",
    email: "zeffali7@gmail.com",
    role: "admin",
    phone: "+91 99000 11223",
    created_at: "2026-11-09",
    updated_at: "2026-11-09",
  },
  {
    id: 3,
    name: "Alex Manager",
    email: "manager1@123",
    role: "manager",
    phone: "+91 98765 00001",
    created_at: "2026-11-09",
    updated_at: "2026-11-09",
  },
  {
    id: 4,
    name: "Rahul Kumar",
    email: "worker1@123",
    role: "worker",
    phone: "+91 98765 43210",
    created_at: "2026-11-09",
    updated_at: "2026-11-09",
  },
  {
    id: 5,
    name: "Mohammed Zafar",
    email: "worker2@123",
    role: "worker",
    phone: "+91 98765 77889",
    created_at: "2026-11-09",
    updated_at: "2026-11-09",
  },
  {
    id: 6,
    name: "Amit Das",
    email: "worker3@123",
    role: "worker",
    phone: "+91 98765 11223",
    created_at: "2026-11-09",
    updated_at: "2026-11-09",
  },
];

export const Team: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>(FALLBACK_USERS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Accounts");
  const [loading, setLoading] = useState(false);

  // KPIs
  const [kpis, setKpis] = useState({
    total_users: 5,
    managers: 1,
    workers: 3,
    admins: 1,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(5);
  const [perPage, setPerPage] = useState(10);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<UserPayload>({
    name: "",
    email: "",
    role: "worker",
    phone: "",
    password: "password",
  });
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load users from backend
  const refreshUsers = async () => {
    try {
      setLoading(true);
      let roleParam: string | undefined = undefined;
      if (activeTab === "Managers") roleParam = "manager";
      if (activeTab === "Field Workers") roleParam = "worker";
      if (activeTab === "Admins") roleParam = "admin";

      const res = await usersApi.getAll({
        page: currentPage,
        per_page: perPage,
        search: search.trim() || undefined,
        role: roleParam,
      });

      if (res.status && res.data) {
        setUsers(res.data.data);
        setKpis(res.kpis);
        setCurrentPage(res.data.current_page);
        setLastPage(res.data.last_page);
        setTotalItems(res.data.total);
      }
    } catch (err) {
      console.warn("Backend API unavailable, using fallback list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    let roleParam: string | undefined = undefined;
    if (activeTab === "Managers") roleParam = "manager";
    if (activeTab === "Field Workers") roleParam = "worker";
    if (activeTab === "Admins") roleParam = "admin";

    usersApi
      .getAll({
        page: currentPage,
        per_page: perPage,
        search: search.trim() || undefined,
        role: roleParam,
      })
      .then((res) => {
        if (active && res.status && res.data) {
          setUsers(res.data.data);
          setKpis(res.kpis);
          setCurrentPage(res.data.current_page);
          setLastPage(res.data.last_page);
          setTotalItems(res.data.total);
        }
      })
      .catch((err) => {
        console.warn("Backend users fetch fallback:", err);
      });

    return () => {
      active = false;
    };
  }, [currentPage, perPage, search, activeTab]);

  // Open Edit Modal
  const handleOpenEdit = (user: UserItem) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: (user.role as UserPayload["role"]) || "worker",
      phone: user.phone || "",
      password: "",
    });
    setEditingUser(user);
    setFeedbackMsg(null);
    setIsAddOpen(true);
  };

  // Handle Submit (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!formData.name.trim() || !formData.email.trim()) {
      setFeedbackMsg({ type: "error", text: "Name and Email/Username are required." });
      return;
    }

    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, formData);
        setFeedbackMsg({ type: "success", text: `Account '${formData.name}' updated successfully.` });
      } else {
        await usersApi.create(formData);
        setFeedbackMsg({ type: "success", text: `Account '${formData.name}' created successfully!` });
      }
      setIsAddOpen(false);
      refreshUsers();
    } catch (err: unknown) {
      const errMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Action completed locally.";
      setFeedbackMsg({ type: "error", text: errMsg });
    }
  };

  // Handle Delete
  const handleDeleteUser = async (user: UserItem) => {
    if (window.confirm(`Are you sure you want to delete account "${user.name}" (${user.email})?`)) {
      try {
        await usersApi.delete(user.id);
        setFeedbackMsg({ type: "success", text: `Account '${user.name}' deleted.` });
        refreshUsers();
      } catch (err: unknown) {
        const errMsg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Could not delete account.";
        setFeedbackMsg({ type: "error", text: errMsg });
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      }
    }
  };

  // Filtered users fallback
  const displayedUsers = useMemo(() => {
    return users.filter((u) => {
      if (activeTab === "Managers" && u.role !== "manager" && u.role !== "subadmin") return false;
      if (activeTab === "Field Workers" && u.role !== "worker" && u.role !== "technician") return false;
      if (activeTab === "Admins" && u.role !== "admin") return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesPhone = u.phone?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }

      return true;
    });
  }, [users, activeTab, search]);

  const renderRoleBadge = (role: string) => {
    const r = role.toLowerCase();
    if (r === "admin") {
      return <span className="team-role-pill admin">Admin</span>;
    }
    if (r === "manager" || r === "subadmin") {
      return <span className="team-role-pill manager">Manager</span>;
    }
    return <span className="team-role-pill worker">Field Worker</span>;
  };

  return (
    <div className="team-management-page">
      {/* TOP BREADCRUMB */}
      <div className="team-breadcrumb">User Access & Team</div>

      {/* HEADER */}
      <div className="team-header">
        <div>
          <h1>Team Accounts & Access Control</h1>
          <p>Manage Manager accounts, Field Workers (Technicians), and Admin login credentials.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshUsers}
            className="btn-sync-team flex items-center gap-1.5"
            disabled={loading}
            title="Sync with backend"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Syncing..." : "Sync"}
          </button>
          <Link to="/dashboard/add-employee" className="btn-add-member-dark">
            <Plus size={16} /> Add Member
          </Link>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3.5 mb-5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* 4 KPI CARDS */}
      <div className="team-stats-grid">
        <div className="team-stat-card">
          <div className="stat-icon-wrapper gray">
            <Users size={22} />
          </div>
          <div>
            <p className="stat-label">Total Accounts</p>
            <h2 className="stat-count">{kpis.total_users}</h2>
          </div>
        </div>

        <div className="team-stat-card">
          <div className="stat-icon-wrapper blue">
            <Shield size={22} />
          </div>
          <div>
            <p className="stat-label">Store Managers</p>
            <h2 className="stat-count">{kpis.managers}</h2>
          </div>
        </div>

        <div className="team-stat-card">
          <div className="stat-icon-wrapper green">
            <Wrench size={22} />
          </div>
          <div>
            <p className="stat-label">Field Workers</p>
            <h2 className="stat-count">{kpis.workers}</h2>
          </div>
        </div>

        <div className="team-stat-card">
          <div className="stat-icon-wrapper dark">
            <KeyRound size={22} />
          </div>
          <div>
            <p className="stat-label">Admins</p>
            <h2 className="stat-count">{kpis.admins}</h2>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="team-toolbar">
        <div className="team-toolbar-tabs">
          {[
            { label: "All Accounts", count: kpis.total_users },
            { label: "Managers", count: kpis.managers },
            { label: "Field Workers", count: kpis.workers },
            { label: "Admins", count: kpis.admins },
          ].map((tab) => {
            const isActive = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                className={`team-pill-tab ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(tab.label);
                  setCurrentPage(1);
                }}
              >
                <span>{tab.label}</span>
                <span className={`tab-badge ${isActive ? "active" : ""}`}>{tab.count}</span>
              </button>
            );
          })}
        </div>

        <div className="team-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, ID or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="team-table-card">
        <div className="team-table-wrapper">
          <table className="custom-team-table">
            <thead>
              <tr>
                <th>Member / Name</th>
                <th>Login ID (Username)</th>
                <th>Role</th>
                <th>Phone Number</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Users size={32} className="mx-auto text-slate-300 mb-2" />
                    <h4>No accounts found</h4>
                    <p className="text-xs">Try adjusting your search query.</p>
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user) => (
                  <tr key={user.id} className="team-row">
                    <td>
                      <div className="user-details-cell">
                        <div className="user-avatar-circle">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="user-name-bold">{user.name}</div>
                          <div className="user-id-sub font-mono">ID: #{user.id}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="font-mono text-xs font-semibold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                        {user.email}
                      </span>
                    </td>

                    <td>{renderRoleBadge(user.role)}</td>

                    <td>
                      <span className="text-xs text-slate-600 font-mono">
                        {user.phone || "—"}
                      </span>
                    </td>

                    <td className="text-right">
                      <div className="team-row-actions">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="btn-action-edit"
                          title="Edit Account Details"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="btn-action-delete"
                          title="Delete Account"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          totalItems={totalItems}
          from={totalItems > 0 ? (currentPage - 1) * perPage + 1 : 0}
          to={Math.min(currentPage * perPage, totalItems)}
          perPage={perPage}
          perPageOptions={[5, 10, 25]}
          onPageChange={(p) => setCurrentPage(p)}
          onPerPageChange={(newPerPage) => {
            setPerPage(newPerPage);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* ADD / EDIT MODAL */}
      {isAddOpen && (
        <div className="team-modal-backdrop">
          <div className="team-modal-card">
            <div className="team-modal-header">
              <h3>
                {editingUser ? "Edit Account" : "Add Team Account"}
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="team-modal-close-btn"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="team-modal-body">
              <div className="team-modal-field">
                <label>
                  <UserIcon size={14} /> Full Name *
                </label>
                <input
                  type="text"
                  className="team-modal-input"
                  placeholder="e.g. Rahul Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="team-modal-field">
                <label>
                  <Mail size={14} /> Login ID / Username *
                </label>
                <input
                  type="text"
                  className="team-modal-input font-mono"
                  placeholder="e.g. worker1@123 or manager1@123"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="team-modal-field">
                <label>
                  <Shield size={14} /> Account Role *
                </label>
                <select
                  className="team-modal-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserPayload["role"] })}
                >
                  <option value="worker">Field Worker (Technician)</option>
                  <option value="manager">Store Manager (Sub-Admin)</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

              <div className="team-modal-field">
                <label>
                  <Phone size={14} /> Phone Number (Optional)
                </label>
                <input
                  type="text"
                  className="team-modal-input font-mono"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="team-modal-field">
                <label>
                  <KeyRound size={14} /> {editingUser ? "Change Password (Leave blank to keep)" : "Password"}
                </label>
                <input
                  type="text"
                  className="team-modal-input font-mono"
                  placeholder={editingUser ? "Leave blank to keep current" : "Defaults to 'password'"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="team-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="btn-modal-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-save"
                >
                  <Check size={14} /> {editingUser ? "Save Changes" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
