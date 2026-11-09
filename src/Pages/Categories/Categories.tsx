import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CornerDownRight,
  AlertCircle,
  Check,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import './Styles/Categories.css';
import { generateUniqueId } from '../../utils/idGenerator';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description?: string;
  defaultUom?: string;
  productCount: number;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: "cat-1",
    name: "HVAC Equipment & Units",
    slug: "hvac-equipment",
    parentId: null,
    description: "Primary cooling and heating machinery",
    defaultUom: "Pieces",
    productCount: 14,
  },
  {
    id: "cat-2",
    name: "VRF / VRV Systems",
    slug: "vrf-vrv-systems",
    parentId: "cat-1",
    description: "Variable Refrigerant Flow outdoor and indoor modules",
    defaultUom: "Pieces",
    productCount: 6,
  },
  {
    id: "cat-3",
    name: "Ductable Split Units",
    slug: "ductable-split-units",
    parentId: "cat-1",
    description: "Ceiling suspended high-static ductable units",
    defaultUom: "Pieces",
    productCount: 5,
  },
  {
    id: "cat-4",
    name: "Ducting & Piping Materials",
    slug: "ducting-piping-materials",
    parentId: null,
    description: "Core distribution plumbing, piping, and sheet metal",
    defaultUom: "Meters",
    productCount: 28,
  },
  {
    id: "cat-5",
    name: "Copper Pipes & Tubes",
    slug: "copper-pipes-tubes",
    parentId: "cat-4",
    description: "Refrigerant grade seamless copper pipes",
    defaultUom: "Meters",
    productCount: 12,
  },
  {
    id: "cat-6",
    name: "Thermal Pipe Insulation",
    slug: "thermal-pipe-insulation",
    parentId: "cat-4",
    description: "Nitrile rubber and foam tube insulations",
    defaultUom: "Meters",
    productCount: 8,
  },
  {
    id: "cat-7",
    name: "Consumables & Gases",
    slug: "consumables-gases",
    parentId: null,
    description: "Field recharging gases, brazing rods, and chemicals",
    defaultUom: "Kg",
    productCount: 16,
  },
  {
    id: "cat-8",
    name: "Refrigerant Gases",
    slug: "refrigerant-gases",
    parentId: "cat-7",
    description: "R-32, R-410A, R-134a cylinders and cans",
    defaultUom: "Kg",
    productCount: 7,
  },
  {
    id: "cat-9",
    name: "Hardware & Fasteners",
    slug: "hardware-fasteners",
    parentId: "cat-7",
    description: "Threaded rods, anchor bolts, and unistrut clamps",
    defaultUom: "Pieces",
    productCount: 9,
  },
];

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [search, setSearch] = useState("");

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [defaultUom, setDefaultUom] = useState("Pieces");
  const [formError, setFormError] = useState<string | null>(null);
  const [guardWarning, setGuardWarning] = useState<string | null>(null);

  // Auto-slugify name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  // Safe parent list to prevent circular self-parenting
  const availableParents = useMemo(() => {
    return categories.filter((c) => {
      if (!editingId) return c.parentId === null;
      if (c.id === editingId) return false;
      if (c.parentId === editingId) return false;
      return c.parentId === null;
    });
  }, [categories, editingId]);

  // Hierarchical sort
  const hierarchicalCategories = useMemo(() => {
    const parents = categories.filter((c) => c.parentId === null);
    const result: { item: CategoryItem; isChild: boolean; parentName?: string }[] = [];

    parents.forEach((parent) => {
      result.push({ item: parent, isChild: false });
      const children = categories.filter((c) => c.parentId === parent.id);
      children.forEach((child) => {
        result.push({ item: child, isChild: true, parentName: parent.name });
      });
    });

    const handledIds = new Set(result.map((r) => r.item.id));
    categories.forEach((cat) => {
      if (!handledIds.has(cat.id)) {
        result.push({ item: cat, isChild: !!cat.parentId });
      }
    });

    if (!search.trim()) return result;

    const q = search.toLowerCase();
    return result.filter(
      (r) =>
        r.item.name.toLowerCase().includes(q) ||
        r.item.slug.toLowerCase().includes(q) ||
        (r.parentName && r.parentName.toLowerCase().includes(q))
    );
  }, [categories, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Category Name is required.");
      return;
    }

    const finalSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const duplicate = categories.find(
      (c) => c.slug === finalSlug && c.id !== editingId
    );
    if (duplicate) {
      setFormError(`Slug '${finalSlug}' is already used by category '${duplicate.name}'.`);
      return;
    }

    if (editingId) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingId
            ? {
                ...cat,
                name: name.trim(),
                slug: finalSlug,
                parentId: parentId ? parentId : null,
                description: description.trim(),
                defaultUom,
              }
            : cat
        )
      );
      resetForm();
    } else {
      const newCat: CategoryItem = {
        id: generateUniqueId("cat"),
        name: name.trim(),
        slug: finalSlug,
        parentId: parentId ? parentId : null,
        description: description.trim(),
        defaultUom,
        productCount: 0,
      };
      setCategories((prev) => [...prev, newCat]);
      resetForm();
    }
  };

  const handleEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setParentId(cat.parentId || "");
    setDescription(cat.description || "");
    setDefaultUom(cat.defaultUom || "Pieces");
    setFormError(null);
    setGuardWarning(null);
  };

  const handleDelete = (cat: CategoryItem) => {
    const childCount = categories.filter((c) => c.parentId === cat.id).length;
    if (childCount > 0) {
      setGuardWarning(
        `Cannot delete '${cat.name}': It has ${childCount} active subcategories. Please reassign or delete subcategories first.`
      );
      return;
    }

    if (cat.productCount > 0) {
      setGuardWarning(
        `Cannot delete '${cat.name}': It currently has ${cat.productCount} products assigned. Move products to another category first.`
      );
      return;
    }

    if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      if (editingId === cat.id) resetForm();
      setGuardWarning(null);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setParentId("");
    setDescription("");
    setDefaultUom("Pieces");
    setFormError(null);
  };

  return (
    <div className="categories-page">
      {/* TOP BREADCRUMB */}
      <div className="categories-breadcrumb">Inventory</div>

      {/* HEADER SECTION */}
      <div className="categories-header">
        <h1>Product Categories & Taxonomy</h1>
        <p>WordPress-style category and subcategory structure for HVAC units, materials, and parts.</p>
      </div>

      {guardWarning && (
        <div className="guard-alert-box">
          <AlertCircle size={20} className="shrink-0" />
          <div className="flex-1">
            <strong>Action Guarded:</strong> {guardWarning}
          </div>
          <button onClick={() => setGuardWarning(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2-COLUMN LAYOUT */}
      <div className="categories-layout">
        {/* LEFT COLUMN: FORM CARD */}
        <div className="category-form-card">
          <div className="card-title">
            {editingId ? "Edit Category" : "Add New Category"}
          </div>
          <div className="card-subtitle">
            {editingId
              ? "Modify category details or change its parent hierarchy"
              : "Create a top-level category or a nested subcategory"}
          </div>

          <form onSubmit={handleSubmit}>
            {formError && (
              <div className="p-3 mb-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {formError}
              </div>
            )}

            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Copper Pipes & Tubes"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
              <p className="hint">The name as it will appear in catalog forms and filters.</p>
            </div>

            <div className="form-group">
              <label>Parent Category</label>
              <select
                className="form-select"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">None — Top-Level Category</option>
                {availableParents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))}
              </select>
              <p className="hint">Assign a parent to nest this as a subcategory.</p>
            </div>

            <div className="form-group">
              <label>Slug</label>
              <input
                type="text"
                className="form-input font-mono text-xs"
                placeholder="e.g. copper-pipes-tubes"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <p className="hint">URL-friendly unique identifier.</p>
            </div>

            <div className="form-group">
              <label>Default Unit of Measurement (UOM)</label>
              <select
                className="form-select"
                value={defaultUom}
                onChange={(e) => setDefaultUom(e.target.value)}
              >
                <option value="Pieces">Pieces (Units / Equipment)</option>
                <option value="Meters">Meters (Copper Pipes / Insulations)</option>
                <option value="Kg">Kg (Refrigerant Gases / Rods)</option>
                <option value="Sq.Ft">Sq.Ft (GI Ducting Sheets / Wraps)</option>
                <option value="Liters">Liters (Chilled Water Chemicals)</option>
              </select>
              <p className="hint">Default consumption unit for items in this category.</p>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Briefly describe the materials or equipment in this group..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary-dark">
                {editingId ? <Check size={16} /> : <Plus size={16} />}
                {editingId ? "Save Changes" : "Add Category"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn-secondary-light">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: TAXONOMY TABLE CARD */}
        <div className="category-table-card">
          <div className="table-toolbar">
            <div className="search-pill-container">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="table-stats-pill">
              Total Categories: <strong>{categories.length}</strong>
            </div>
          </div>

          <div className="cat-table-wrap">
            <table className="cat-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Parent / Hierarchy</th>
                  <th>Default UOM</th>
                  <th className="text-center">Products</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hierarchicalCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      <Layers size={36} className="mx-auto text-gray-300" />
                      <h4>No categories found</h4>
                      <p className="text-xs">Create your first category using the form on the left.</p>
                    </td>
                  </tr>
                ) : (
                  hierarchicalCategories.map(({ item, isChild, parentName }) => (
                    <tr key={item.id}>
                      <td>
                        <div className="cat-name-cell">
                          {isChild && (
                            <span className="cat-indent-icon">
                              <CornerDownRight size={15} />
                            </span>
                          )}
                          <div>
                            <div className="cat-primary-name">{item.name}</div>
                            <div className="cat-slug-sub">/{item.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {isChild ? (
                          <span className="cat-parent-pill">
                            <ArrowRight size={11} /> {parentName}
                          </span>
                        ) : (
                          <span className="cat-top-level-pill">Top-Level</span>
                        )}
                      </td>
                      <td>
                        <span className="cat-uom-pill">
                          {item.defaultUom || "Pieces"}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="cat-count-badge" title={`${item.productCount} active products`}>
                          {item.productCount}
                        </span>
                      </td>
                      <td>
                        <div className="cat-actions">
                          <button
                            onClick={() => handleEdit(item)}
                            className="action-icon-btn"
                            title="Edit Category"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="action-icon-btn delete"
                            title="Delete Category"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
