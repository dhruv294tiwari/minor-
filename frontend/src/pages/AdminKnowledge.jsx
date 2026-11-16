import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  BookOpen,
  RotateCw,
  Eye
} from 'lucide-react';
import { knowledgeApi, categoryApi } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast } from '../components/Toast';

export const AdminKnowledge = () => {
  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');

  // Modals & Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'

  // Form State
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    question: '',
    answer: '',
    keywords: '',
    source: 'Official MAIT Notice',
    source_url: '',
    verified: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.listAdmin();
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category_id = parseInt(selectedCategory);
      if (verifiedFilter !== '') params.verified = verifiedFilter === 'true';

      const res = await knowledgeApi.list(params);
      setEntries(res.data);
    } catch (err) {
      console.error("Failed to load knowledge entries:", err);
      setToast({ type: 'error', message: 'Failed to load knowledge entries from database.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [selectedCategory, verifiedFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEntries();
  };

  const openCreateModal = () => {
    setFormMode('create');
    setFormData({
      category_id: categories.length > 0 ? categories[0].id : '',
      title: '',
      question: '',
      answer: '',
      keywords: '',
      source: 'Official MAIT Notice',
      source_url: '',
      verified: true,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (entry) => {
    setFormMode('edit');
    setSelectedEntry(entry);
    setFormData({
      category_id: entry.category_id,
      title: entry.title,
      question: entry.question,
      answer: entry.answer,
      keywords: entry.keywords || '',
      source: entry.source || 'Official MAIT Notice',
      source_url: entry.source_url || '',
      verified: entry.verified,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openDetailModal = (entry) => {
    setSelectedEntry(entry);
    setIsDetailOpen(true);
  };

  const openDeleteModal = (entry) => {
    setSelectedEntry(entry);
    setIsDeleteOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.category_id) errs.category_id = "Please select a category";
    if (!formData.title.trim()) errs.title = "Title is required";
    if (!formData.question.trim()) errs.question = "Question / Topic is required";
    if (!formData.answer.trim()) errs.answer = "Answer is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        category_id: parseInt(formData.category_id),
        title: formData.title.trim(),
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        keywords: formData.keywords.trim() || null,
        source: formData.source.trim() || "Official MAIT Notice",
        source_url: formData.source_url.trim() || null,
        verified: formData.verified,
      };

      if (formMode === 'create') {
        await knowledgeApi.create(payload);
        setToast({ type: 'success', message: 'Knowledge entry created successfully.' });
      } else {
        await knowledgeApi.update(selectedEntry.id, payload);
        setToast({ type: 'success', message: 'Knowledge entry updated successfully.' });
      }
      setIsFormOpen(false);
      fetchEntries();
    } catch (err) {
      console.error("Save knowledge entry error:", err);
      const msg = err.response?.data?.detail || 'Failed to save knowledge entry.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEntry) return;
    setSubmitting(true);
    try {
      await knowledgeApi.delete(selectedEntry.id);
      setToast({ type: 'success', message: 'Knowledge entry deleted successfully.' });
      setIsDeleteOpen(false);
      fetchEntries();
    } catch (err) {
      console.error("Delete knowledge entry error:", err);
      const msg = err.response?.data?.detail || 'Failed to delete knowledge entry.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-mait-navy-900 tracking-tight">
            Verified Knowledge Base
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage verified MAIT institutional information and official facts
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchEntries}
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
            <span>Add Knowledge Entry</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search text */}
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, question, keywords, answer..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-mait-navy-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full py-2 px-3 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-mait-navy-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Verified Status Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="block w-full py-2 px-3 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-mait-navy-500"
            >
              <option value="">All Statuses</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified</option>
            </select>
          </div>

        </form>
      </div>

      {/* Knowledge Entries Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Title & Question</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-mait-navy-800 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading entries...</span>
                    </div>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No knowledge entries found matching your criteria.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 max-w-xs sm:max-w-md">
                      <div className="font-semibold text-mait-navy-900 truncate">
                        {entry.title}
                      </div>
                      <div className="text-slate-500 text-xs truncate mt-0.5">
                        {entry.question}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {entry.category?.name || "General"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {entry.verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>Draft</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[150px] truncate text-xs">
                      {entry.source || "Official Notice"}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openDetailModal(entry)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-mait-navy-800 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(entry)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Entry"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(entry)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Entry"
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

      {/* CREATE / EDIT KNOWLEDGE MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formMode === 'create' ? "Add New Verified Knowledge Entry" : "Edit Knowledge Entry"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className={`block w-full px-3 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-mait-navy-500 ${
                formErrors.category_id ? 'border-red-300 bg-red-50' : 'border-slate-300'
              }`}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {formErrors.category_id && (
              <p className="text-[11px] text-red-600 mt-1">{formErrors.category_id}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. End-Semester Examination Schedule 2026"
              className={`block w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mait-navy-500 ${
                formErrors.title ? 'border-red-300 bg-red-50' : 'border-slate-300'
              }`}
            />
            {formErrors.title && (
              <p className="text-[11px] text-red-600 mt-1">{formErrors.title}</p>
            )}
          </div>

          {/* Question / Student Query Topic */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Question / Query Topic *
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="e.g. When will the semester exams begin?"
              className={`block w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mait-navy-500 ${
                formErrors.question ? 'border-red-300 bg-red-50' : 'border-slate-300'
              }`}
            />
            {formErrors.question && (
              <p className="text-[11px] text-red-600 mt-1">{formErrors.question}</p>
            )}
          </div>

          {/* Answer */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Verified Answer *
            </label>
            <textarea
              rows={4}
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Enter official and verified institutional facts..."
              className={`block w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mait-navy-500 ${
                formErrors.answer ? 'border-red-300 bg-red-50' : 'border-slate-300'
              }`}
            />
            {formErrors.answer && (
              <p className="text-[11px] text-red-600 mt-1">{formErrors.answer}</p>
            )}
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Search Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="e.g. exam, datesheet, timetable, schedule, dec"
              className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mait-navy-500"
            />
          </div>

          {/* Source & URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Source
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="Official MAIT Notice"
                className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mait-navy-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Source URL (optional)
              </label>
              <input
                type="url"
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                placeholder="https://mait.ac.in/..."
                className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mait-navy-500"
              />
            </div>
          </div>

          {/* Verified Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="verified-checkbox"
              checked={formData.verified}
              onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <label htmlFor="verified-checkbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Mark as Verified MAIT Information (Eligible for ✓ MAIT Verified Badge)
            </label>
          </div>

          {/* Modal Actions */}
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
              {submitting ? "Saving to Database..." : formMode === 'create' ? "Create Entry" : "Update Entry"}
            </button>
          </div>

        </form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Knowledge Entry Details"
      >
        {selectedEntry && (
          <div className="space-y-4 text-sm text-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Title
              </span>
              <p className="font-bold text-base text-mait-navy-900 mt-0.5">
                {selectedEntry.title}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Category
                </span>
                <p className="font-medium text-slate-700 mt-0.5">
                  {selectedEntry.category?.name || "General"}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Status
                </span>
                <p className="font-semibold text-emerald-700 mt-0.5">
                  {selectedEntry.verified ? "✓ MAIT Verified" : "Draft / Unverified"}
                </p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Question / Query Topic
              </span>
              <p className="font-medium text-slate-700 mt-0.5">
                {selectedEntry.question}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Answer Content
              </span>
              <div className="mt-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl whitespace-pre-wrap leading-relaxed">
                {selectedEntry.answer}
              </div>
            </div>

            {selectedEntry.keywords && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Search Keywords
                </span>
                <p className="font-mono text-xs text-slate-600 mt-0.5">
                  {selectedEntry.keywords}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Source: {selectedEntry.source || "Official MAIT Notice"}</span>
              {selectedEntry.source_url && (
                <a
                  href={selectedEntry.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mait-navy-800 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Source URL</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Knowledge Entry"
        message={`Are you sure you want to delete the entry "${selectedEntry?.title}"? This will immediately remove it from verified database retrieval.`}
        confirmLabel="Delete Entry"
        loading={submitting}
      />

    </div>
  );
};
