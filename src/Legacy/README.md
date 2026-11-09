# Legacy & Reference UI Components

This directory preserves the original prototype components created during early development.
They serve as a reference catalog for:
- Pre-built UI forms (`AddProject`, `AddTool`, `AddMaterial`, `AddEmployee`, `AddContract`)
- Table views and quick filter interfaces (`Projects`, `Tools`, `Materials`, `Contracts`, `Team`)
- Prototype CSS styles and layouts

Active pages should NOT import from here directly; instead, migrate components into their respective role folder (`src/Pages/Admin/`, `src/Pages/SubAdmin/`, `src/Pages/Technician/`).
