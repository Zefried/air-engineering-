import React from 'react';
import { UploadCloud } from 'lucide-react';
import './Styles/AddEmployee.css';

const AddEmployee = () => {
  return (
    <div className="admin-panel-content">
      <div className="add-member-wrapper">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Add Member</h2>
          <p className="text-gray-500">Register a new employee in the system</p>
        </div>

        <div className="add-member-card">
          <h3>Employee Information</h3>
          
          <form className="member-form">
            <div className="form-group">
              <label>Full Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. John Doe" />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Employee ID <span className="text-red-500">*</span></label>
                <input type="text" placeholder="EMP-100" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select defaultValue="technician">
                  <option value="manager">Project Manager</option>
                  <option value="technician">Technician</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="john@company.com" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="+91 98765 43210" />
              </div>
            </div>
            
            <div className="form-group">
              <label>Employment Status</label>
              <select defaultValue="active">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Profile Photo (optional)</label>
              <div className="image-upload-zone">
                <UploadCloud size={32} className="upload-icon" />
                <p className="upload-text">Upload profile photo</p>
                <p className="upload-hint">PNG, JPG or WEBP</p>
                <input type="file" className="hidden-file-input" accept="image/png, image/jpeg, image/webp" />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel">Cancel</button>
              <button type="button" className="btn-submit">Add Member</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
