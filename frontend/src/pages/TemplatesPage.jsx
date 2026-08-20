import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Plus, 
  Copy, 
  Eye, 
  Send, 
  Trash2, 
  Loader2, 
  ShieldCheck, 
  X, 
  Check, 
  BookOpen
} from 'lucide-react';
import { getTemplates, duplicateTemplate, createTemplate, deleteTemplate } from '../services/api';

const CATEGORIES = [
  'All',
  'Internship',
  'Job Application',
  'Referral',
];

export default function TemplatesPage() {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    title: '',
    category: 'Internship',
    subject: '',
    body: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplatesList();
  }, [selectedCategory, searchQuery]);

  const fetchTemplatesList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTemplates({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery || undefined,
      });
      setTemplates(data.templates || []);
      if (data.categoryCounts) {
        setCategoryCounts(data.categoryCounts);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await duplicateTemplate(id);
      alert(`Template "${res.template.title}" created!`);
      fetchTemplatesList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to duplicate template');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete template "${title}"?`)) return;
    try {
      await deleteTemplate(id);
      fetchTemplatesList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete template');
    }
  };

  const handleUseInCampaign = (template) => {
    navigate('/campaigns/new', {
      state: {
        templateSubject: template.subject,
        templateBody: template.body,
        templateTitle: template.title,
      },
    });
  };

  const handleCreateCustomTemplate = async (e) => {
    e.preventDefault();
    if (!addForm.title || !addForm.subject || !addForm.body) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await createTemplate(addForm);
      setIsAddModalOpen(false);
      setAddForm({ title: '', category: 'Internship', subject: '', body: '' });
      fetchTemplatesList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create template');
    } finally {
      setSubmitting(false);
    }
  };

  const renderTextWithTags = (text = '') => {
    const parts = text.split(/(\{\{[^}]+\}\})/g);
    return parts.map((part, idx) => {
      if (/^\{\{[^}]+\}\}$/.test(part)) {
        return (
          <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-mono font-bold mx-0.5 border border-blue-200">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Email Templates Library
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse templates for Internship, Job Application, and Referral outreach. System templates are read-only — duplicate to customize.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Template
        </button>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-4">
        {/* Category Tabs Pill Bar */}
        <div className="flex items-center gap-2">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] || (cat === 'All' ? templates.length : 0);
            const isActive = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by name, subject, or body…"
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs font-medium">Loading email templates...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-rose-600 text-xs font-medium">
          {error}
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No templates found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No templates match category "{selectedCategory}" or search query "{searchQuery}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {tpl.category}
                  </span>

                  {tpl.isSystem ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" /> System
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                      Custom
                    </span>
                  )}
                </div>

                {/* Title & Subject */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{tpl.title}</h3>
                  <p className="text-xs text-slate-600 font-medium mt-1 line-clamp-1">
                    Subject: {renderTextWithTags(tpl.subject)}
                  </p>
                </div>

                {/* Body Snippet */}
                <p className="text-xs text-slate-500 line-clamp-3 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 leading-relaxed font-sans">
                  {renderTextWithTags(tpl.body)}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewTemplate(tpl)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>

                  <button
                    onClick={() => handleDuplicate(tpl._id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" /> Duplicate
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleUseInCampaign(tpl)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Use
                  </button>

                  {!tpl.isSystem && (
                    <button
                      onClick={() => handleDelete(tpl._id, tpl.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Custom Template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PREVIEW TEMPLATE MODAL */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">{previewTemplate.title}</h3>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Subject Line:</span>
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-slate-900 mt-1">
                  {renderTextWithTags(previewTemplate.subject)}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Email Body:</span>
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 whitespace-pre-wrap font-sans leading-relaxed mt-1">
                  {renderTextWithTags(previewTemplate.body)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => handleDuplicate(previewTemplate._id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                <Copy className="w-4 h-4" /> Duplicate & Customize
              </button>

              <button
                onClick={() => {
                  const tpl = previewTemplate;
                  setPreviewTemplate(null);
                  handleUseInCampaign(tpl);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                <Send className="w-4 h-4" /> Use in Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM TEMPLATE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCustomTemplate}
            className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" /> Add Custom Email Template
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  placeholder="e.g. Frontend Internship Outreach"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={addForm.category}
                  onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Line *</label>
                <input
                  type="text"
                  value={addForm.subject}
                  onChange={(e) => setAddForm({ ...addForm, subject: e.target.value })}
                  placeholder="e.g. Application for {{role}} at {{company}}"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Body *</label>
                <textarea
                  rows={6}
                  value={addForm.body}
                  onChange={(e) => setAddForm({ ...addForm, body: e.target.value })}
                  placeholder="Hi {{name}},\n\nReaching out regarding {{role}} at {{company}}..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500 font-sans leading-relaxed"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Template
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
