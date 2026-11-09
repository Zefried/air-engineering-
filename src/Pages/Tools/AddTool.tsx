import { UploadCloud } from 'lucide-react';
import './Styles/AddTool.css';

const AddTool = () => {
  return (
    <div className="admin-panel-content">
      <div className="add-tool-wrapper">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Add New Tool</h2>
          <p className="text-gray-500">Register a tool in your inventory</p>
        </div>

        <div className="add-tool-card">
          <h3>Tool Information</h3>
          
          <form className="tool-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Tool Name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g. Impact Drill" />
              </div>
              <div className="form-group">
                <label>Tool ID <span className="text-red-500">*</span></label>
                <input type="text" placeholder="TL-025" />
              </div>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select defaultValue="">
                <option value="" disabled>Select category</option>
                <option value="power-tools">Power Tools</option>
                <option value="hand-tools">Hand Tools</option>
                <option value="safety">Safety Equipment</option>
                <option value="measuring">Measuring</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} placeholder="Tool details or specifications..."></textarea>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Quantity <span className="text-red-500">*</span></label>
                <input type="number" defaultValue="1" min="1" />
              </div>
              <div className="form-group">
                <label>Condition</label>
                <select defaultValue="good">
                  <option value="new">New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Tool Image (optional)</label>
              <div className="image-upload-zone">
                <UploadCloud size={32} className="upload-icon" />
                <p className="upload-text">Upload tool image</p>
                <p className="upload-hint">PNG, JPG or WEBP</p>
                <input type="file" className="hidden-file-input" accept="image/png, image/jpeg, image/webp" />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel">Cancel</button>
              <button type="button" className="btn-submit">Add Tool</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTool;
