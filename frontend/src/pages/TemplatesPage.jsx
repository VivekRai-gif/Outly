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
    navigate('/dashboard/campaigns/new', {
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
          <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/10 text-white text-[11px] font-mono font-bold mx-0.5 border border-white/20">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#FBFBFC] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-white" />
            Email Templates Library
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Browse templates for Internship, Job Application, and Referral outreach. System templates are read-only — duplicate to customize.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="primary-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Template
        </button>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="bg-[#0E0E0E] rounded-2xl p-4 border border-white/10 shadow-2xl space-y-4">
        {/* Category Tabs Pill Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] || (cat === 'All' ? templates.length : 0);
            const isActive = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-2xs'
                    : 'bg-[#1A1B1A] hover:bg-[#262626] text-[#A1A1AA] hover:text-white border border-white/10'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-black text-white' : 'bg-[#262626] text-[#A1A1AA]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by name, subject, or body…"
            className="w-full pl-9 pr-4 py-2 bg-[#1A1B1A] border border-white/10 rounded-xl text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white/30"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="bg-[#0E0E0E] rounded-2xl border border-white/10 p-12 text-center text-[#71717A] flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
          <span className="text-xs font-medium">Loading email templates...</span>
        </div>
      ) : error ? (
        <div className="bg-[#0E0E0E] rounded-2xl border border-white/10 p-8 text-center text-white text-xs font-medium">
          {error}
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-[#0E0E0E] rounded-2xl border border-white/10 p-12 text-center space-y-3">
          <FileText className="w-8 h-8 text-[#71717A] mx-auto" />
          <h3 className="text-sm font-bold text-[#FBFBFC]">No templates found</h3>
          <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
            No templates match category "{selectedCategory}" or search query "{searchQuery}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl._id}
              className="bg-[#1A1B1A] rounded-2xl border border-white/10 shadow-2xl p-5 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/15">
                    {tpl.category}
                  </span>

                  {tpl.isSystem ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/15 uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" /> System
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-white text-black font-bold uppercase tracking-wider">
                      Custom
                    </span>
                  )}
                </div>

                {/* Title & Subject */}
                <div>
                  <h3 className="font-bold text-sm text-[#FBFBFC]">{tpl.title}</h3>
                  <p className="text-xs text-[#A1A1AA] font-medium mt-1 line-clamp-1">
                    Subject: {renderTextWithTags(tpl.subject)}
                  </p>
                </div>

                {/* Body Snippet */}
                <p className="text-xs text-[#A1A1AA] line-clamp-3 bg-[#0E0E0E] p-3 rounded-xl border border-white/10 leading-relaxed font-sans">
                  {renderTextWithTags(tpl.body)}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewTemplate(tpl)}
                    className="secondary-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>

                  <button
                    onClick={() => handleDuplicate(tpl._id)}
                    className="secondary-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5" /> Duplicate
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleUseInCampaign(tpl)}
                    className="primary-btn inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    <Send className="w-3.5 h-3.5" /> Use
                  </button>

                  {!tpl.isSystem && (
                    <button
                      onClick={() => handleDelete(tpl._id, tpl.title)}
                      className="p-1.5 text-[#71717A] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E0E0E] rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm text-[#FBFBFC]">{previewTemplate.title}</h3>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1 text-[#71717A] hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-[#71717A] uppercase tracking-wider text-[10px]">Subject Line:</span>
                <div className="p-2.5 bg-[#1A1B1A] border border-white/10 rounded-xl font-bold text-white mt-1">
                  {renderTextWithTags(previewTemplate.subject)}
                </div>
              </div>

              <div>
                <span className="font-semibold text-[#71717A] uppercase tracking-wider text-[10px]">Email Body:</span>
                <div className="p-3.5 bg-[#1A1B1A] border border-white/10 rounded-xl text-[#F5F5F5] whitespace-pre-wrap font-sans leading-relaxed mt-1">
                  {renderTextWithTags(previewTemplate.body)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                onClick={() => handleDuplicate(previewTemplate._id)}
                className="secondary-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              >
                <Copy className="w-4 h-4" /> Duplicate & Customize
              </button>

              <button
                onClick={() => {
                  const tpl = previewTemplate;
                  setPreviewTemplate(null);
                  handleUseInCampaign(tpl);
                }}
                className="primary-btn inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold"
              >
                <Send className="w-4 h-4" /> Use in Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM TEMPLATE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCustomTemplate}
            className="bg-[#0E0E0E] rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-white/10"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-[#FBFBFC] flex items-center gap-2">
                <Plus className="w-4 h-4 text-white" /> Add Custom Email Template
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#71717A] hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Template Name *</label>
                <input
                  type="text"
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  placeholder="e.g. Frontend Internship Outreach"
                  className="w-full px-3 py-2 bg-[#1A1B1A] border border-white/10 rounded-xl text-white placeholder:text-[#71717A] focus:outline-none focus:border-white/30"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Category *</label>
                <select
                  value={addForm.category}
                  onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1B1A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat} className="bg-[#1A1B1A] text-white">{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Subject Line *</label>
                <input
                  type="text"
                  value={addForm.subject}
                  onChange={(e) => setAddForm({ ...addForm, subject: e.target.value })}
                  placeholder="e.g. Application for {{role}} at {{company}}"
                  className="w-full px-3 py-2 bg-[#1A1B1A] border border-white/10 rounded-xl text-white font-mono placeholder:text-[#71717A] focus:outline-none focus:border-white/30"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Email Body *</label>
                <textarea
                  rows={6}
                  value={addForm.body}
                  onChange={(e) => setAddForm({ ...addForm, body: e.target.value })}
                  placeholder="Hi {{name}},\n\nReaching out regarding {{role}} at {{company}}..."
                  className="w-full px-3 py-2 bg-[#1A1B1A] border border-white/10 rounded-xl text-white font-sans leading-relaxed placeholder:text-[#71717A] focus:outline-none focus:border-white/30"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="secondary-btn px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="primary-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
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
