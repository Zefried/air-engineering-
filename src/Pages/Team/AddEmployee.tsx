import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Check, KeyRound, Mail, User, Shield, Phone, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import './Styles/AddEmployee.css';
import { usersApi } from '../../api/usersApi';
import type { UserPayload } from '../../api/usersApi';

export const AddEmployee: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UserPayload>({
    name: "",
    email: "",
    role: "worker",
    phone: "",
    password: "password",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg("Full Name and Login ID / Username are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await usersApi.create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        phone: formData.phone?.trim() || undefined,
        password: formData.password?.trim() || "password",
      });
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/dashboard/employees");
      }, 700);
    } catch (err: unknown) {
      const apiMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErrorMsg(apiMsg || "Failed to create user account. Ensure username/email is unique.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-employee-container">
      {/* BACK BUTTON */}
      <Link to="/dashboard/employees" className="add-employee-back-btn">
        <ArrowLeft size={16} /> Back to Team Accounts
      </Link>

      {/* HEADER */}
      <div className="add-employee-header">
        <div className="header-icon-box">
          <UserPlus size={22} />
        </div>
        <div>
          <h1>Create Team Account</h1>
          <p>Register a Manager, Field Worker (Technician), or Admin login account.</p>
        </div>
      </div>

      {/* FEEDBACK ALERTS */}
      {errorMsg && (
        <div className="alert-box-error">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isSuccess && (
        <div className="alert-box-success">
          <Check size={16} className="shrink-0" />
          <span>Account created successfully! Redirecting to team roster...</span>
        </div>
      )}

      {/* MAIN FORM CARD */}
      <div className="add-employee-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group-block">
            {/* NAME */}
            <div className="form-field-group">
              <label>
                <User size={14} /> Member Full Name *
              </label>
              <input
                type="text"
                className="employee-input"
                placeholder="e.g. Rahul Kumar or Alex Manager"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* LOGIN ID */}
            <div className="form-field-group">
              <label>
                <Mail size={14} /> Login ID / Username *
              </label>
              <input
                type="text"
                className="employee-input font-mono"
                placeholder="e.g. worker1@123 or manager1@123"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <p className="form-field-help">
                Field workers and managers sign in with this exact login ID.
              </p>
            </div>

            {/* ROLE & PHONE (2 COLUMNS) */}
            <div className="employee-row-2col">
              <div className="form-field-group">
                <label>
                  <Shield size={14} /> Account Role *
                </label>
                <select
                  className="employee-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserPayload["role"] })}
                >
                  <option value="worker">Field Worker (Technician)</option>
                  <option value="manager">Store Manager (Sub-Admin)</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

              <div className="form-field-group">
                <label>
                  <Phone size={14} /> Phone Number
                </label>
                <input
                  type="text"
                  className="employee-input font-mono"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="form-field-group">
              <label>
                <KeyRound size={14} /> Initial Password
              </label>
              <input
                type="text"
                className="employee-input font-mono"
                placeholder="Defaults to 'password'"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <p className="form-field-help">
                Preset default is: <strong>password</strong>. Worker can log in immediately.
              </p>
            </div>
          </div>

          {/* ACTIONS ROW */}
          <div className="employee-actions-row">
            <Link to="/dashboard/employees" className="btn-cancel-account">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-create-account"
            >
              <Check size={16} /> {isSubmitting ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
