import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  FolderTree,
  Edit2,
  Trash2,
  RotateCw,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { categoryApi } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast } from '../components/Toast';

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.listAdmin();
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setToast({ type: 'error', message: 'Failed to load categories from database.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      cat.name.toLowerCase().includes(term) ||
      (cat.description && cat.description.toLowerCase().includes(term))
    );
  });

  const openCreateModal = () => {
    setFormMode('create');
    setName('');
    setDescription('');
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (cat) => {
    setFormMode('edit');
    setSelectedCat(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openDeleteModal = (cat) => {
    setSelectedCat(cat);
    setIsDeleteOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Category name is required";
    else if (name.trim().length < 2) errs.name = "Category name must be at least 2 characters";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (formMode === 'create') {
        await categoryApi.create({ name: name.trim(), description: description.trim() || null });
        setToast({ type: 'success', message: `Category '${name.trim()}' created successfully.` });
      } else {
        await categoryApi.update(selectedCat.id, { name: name.trim(), description: description.trim() || null });
        setToast({ type: 'success', message: `Category '${name.trim()}' updated successfully.` });
      }
      setIsFormOpen(false);
      fetchCategories();
    } catch (err) {
      console.error("Save category error:", err);
      const msg = err.response?.data?.detail || 'Failed to save category.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCat) return;
    setSubmitting(true);
    try {
      await categoryApi.delete(selectedCat.id);
      setToast({ type: 'success', message: `Category '${selectedCat.name}' deleted successfully.` });
      setIsDeleteOpen(false);
      fetchCategories();
    } catch (err) {
      console.error("Delete category error:", err);
      const msg = err.response?.data?.detail || 'Failed to delete category.';
      setToast({ type: 'error', message: msg });
      setIsDeleteOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-mait-navy-900 tracking-tight">
            Knowledge Categories
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize institutional domains, departments, and topics
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchCategories}
            className="p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
            title="Refresh"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-mait-crimson-600 hover:bg-mait-crimson-700 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Category</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name or description..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-mait-navy-500"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Category Name</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-center">Entries</th>
                <th className="py-3.5 px-4">Last Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-mait-navy-800 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-mait-navy-900">
                      {cat.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate text-xs">
                      {cat.description || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <BookOpen className="w-3 h-3" />
                        <span>{cat.entries_count}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {new Date(cat.updated_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(cat)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formMode === 'create' ? "Create New Category" : "Edit Category"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Scholarships, Placements, Transport"
              className={`block w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mait-navy-500 ${
                formErrors.name ? 'border-red-300 bg-red-50' : 'border-slate-300'
              }`}
            />
            {formErrors.name && (
              <p className="text-[11px] text-red-600 mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description (optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the domain or topic coverage..."
              className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mait-navy-500"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-mait-navy-800 hover:bg-mait-navy-900 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Saving..." : formMode === 'create' ? "Create Category" : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={
          selectedCat?.entries_count > 0
            ? `Warning: Category "${selectedCat?.name}" contains ${selectedCat?.entries_count} knowledge entries. Deletion will be rejected by the server to protect data integrity until those entries are moved or removed.`
            : `Are you sure you want to delete the category "${selectedCat?.name}"? This action cannot be undone.`
        }
        confirmLabel="Delete Category"
        loading={submitting}
      />

    </div>
  );
};
