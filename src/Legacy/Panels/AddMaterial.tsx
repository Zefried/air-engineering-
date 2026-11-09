import React from 'react';
import './Styles/AddMaterial.css';

const AddMaterial = () => {
  return (
    <div className="admin-panel-content">
      <div className="add-material-wrapper">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Add Material</h2>
          <p className="text-gray-500">Register new material in the inventory</p>
        </div>

        <div className="add-material-card">
          <h3>Material Information</h3>
          
          <form className="material-form">
            <div className="form-group">
              <label>Material Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. Copper Pipes" />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Material ID <span className="text-red-500">*</span></label>
                <input type="text" placeholder="MAT-100" />
              </div>
              <div className="form-group">
                <label>Unit of Measure <span className="text-red-500">*</span></label>
                <select defaultValue="coils">
                  <option value="coils">Coils</option>
                  <option value="cylinders">Cylinders</option>
                  <option value="rolls">Rolls</option>
                  <option value="pieces">Pieces</option>
                  <option value="boxes">Boxes</option>
                  <option value="packs">Packs</option>
                  <option value="sheets">Sheets</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Initial Quantity</label>
                <input type="number" defaultValue={0} min="0" />
              </div>
              <div className="form-group">
                <label>Minimum Threshold <span className="text-red-500">*</span></label>
                <input type="number" defaultValue={5} min="1" />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel">Cancel</button>
              <button type="button" className="btn-submit">Add Material</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMaterial;
