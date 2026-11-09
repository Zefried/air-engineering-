import './Styles/AddProject.css';

const AddProject = () => {
  return (
    <div className="admin-panel-content">
      <div className="add-project-wrapper">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Admin Panel — Add Project</h2>
          <p className="text-gray-500">Admin ka form sirf project setup ke liye hoga.</p>
        </div>

        <div className="add-project-card">
          <h3>Project Information</h3>

          <form className="project-form">
            <div className="form-group">
              <label>Project Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. Central Mall HVAC" />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Client / Site Name</label>
                <input type="text" placeholder="Enter client or site name" />
              </div>
              <div className="form-group">
                <label>Project Location</label>
                <input type="text" placeholder="Enter site address" />
              </div>
            </div>

            <div className="form-group">
              <label>Project Description</label>
              <textarea rows={3} placeholder="Describe the HVAC work"></textarea>
            </div>

            <div className="form-group">
              <label>Assign Manager <span className="text-red-500">*</span></label>
              <select defaultValue="">
                <option value="" disabled>Select a manager</option>
                <option value="rahul">Rahul Sharma</option>
                <option value="amit">Amit Das</option>
                <option value="priya">Priya Singh</option>
              </select>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" />
              </div>
              <div className="form-group">
                <label>Expected Completion Date</label>
                <input type="date" />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel">Cancel</button>
              <button type="button" className="btn-submit">Create Project</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProject;
