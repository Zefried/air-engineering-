import React from 'react';
import './Styles/AddContract.css';

const AddContract = () => {
  return (
    <div className="admin-panel-content">
      <div className="add-contract-wrapper">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Add Contract</h2>
          <p className="text-gray-500">Register a new Annual Maintenance Contract</p>
        </div>

        <div className="add-contract-card">
          <h3>Contract Information</h3>
          
          <form className="contract-form">
            <div className="form-group">
              <label>Client / Site Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Enter client or site name" />
            </div>
            
            <div className="form-group">
              <label>Site Address</label>
              <textarea rows={2} placeholder="Enter full site address"></textarea>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Contract ID <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g. AMC-100" />
              </div>
              <div className="form-group">
                <label>Service Frequency <span className="text-red-500">*</span></label>
                <select defaultValue="annually">
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="bi-annually">Bi-Annually</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Start Date <span className="text-red-500">*</span></label>
                <input type="date" />
              </div>
              <div className="form-group">
                <label>End Date <span className="text-red-500">*</span></label>
                <input type="date" />
              </div>
            </div>

            <div className="form-group">
              <label>Equipment Covered</label>
              <textarea rows={3} placeholder="List AC units, chillers, etc."></textarea>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel">Cancel</button>
              <button type="button" className="btn-submit">Create Contract</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddContract;
