import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Plus, 
  Loader2, 
  Send,
  AlertCircle,
  RefreshCw,
  MailCheck,
  Activity,
  UserPlus,
  X,
  Check
} from 'lucide-react';
import { getContacts, deleteContact, updateContact, checkReplies, createContact } from '../services/api';
import ContactReviewTable from '../components/ContactReviewTable';
import ContactActivityModal from '../components/ContactActivityModal';

export default function ContactsPage() {
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [checkingRepliesState, setCheckingRepliesState] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState(null);

  // Contact Activity Modal State
  const [selectedContactForActivity, setSelectedContactForActivity] = useState(null);

  // Manual Entry Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    phone: '',
    status: 'ready',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContactsList();
  }, [searchQuery, statusFilter]);

  const fetchContactsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getContacts({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
      });
      setContacts(data.contacts || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckReplies = async () => {
    setCheckingRepliesState(true);
    setReplyFeedback(null);
    try {
      const res = await checkReplies();
      setReplyFeedback(`Scan complete: ${res.repliesFound || 0} new replies detected.`);
      fetchContactsList();
    } catch (err) {
      setReplyFeedback(err.response?.data?.message || 'Failed to scan inbox replies');
    } finally {
      setCheckingRepliesState(false);
    }
  };

  const handleUpdateContact = async (id, updatedFields) => {
    try {
      await updateContact(id, updatedFields);
      setContacts((prev) =>
        prev.map((c) => (c._id === id ? { ...c, ...updatedFields } : c))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update contact');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await deleteContact(id);
      setContacts((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete contact');
    }
  };

  const handleBulkDelete = async (idsToDelete) => {
    if (!window.confirm(`Are you sure you want to delete ${idsToDelete.length} selected contacts?`)) return;
    try {
      await Promise.all(idsToDelete.map((id) => deleteContact(id)));
      setContacts((prev) => prev.filter((c) => !idsToDelete.includes(c._id)));
      setSelectedContactIds([]);
    } catch (err) {
      alert('Failed to delete selected contacts');
    }
  };

  const handleCreateCampaignFromSelected = () => {
    if (selectedContactIds.length === 0) return;
    navigate('/campaigns/new', {
      state: { selectedContactIds },
    });
  };

  const handleAddContactSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email) {
      alert('Name and Email are required.');
      return;
    }

    setSubmitting(true);
    try {
      await createContact(addForm);
      setIsAddModalOpen(false);
      setAddForm({ name: '', email: '', company: '', role: '', phone: '', status: 'ready' });
      fetchContactsList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create contact');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Contacts Directory</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your verified outreach contacts, edit details, add manual entries, and track recipient statuses.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Manual Entry
          </button>

          <button
            onClick={handleCheckReplies}
            disabled={checkingRepliesState}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            title="Scan Gmail Inbox for incoming replies"
          >
            {checkingRepliesState ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <MailCheck className="w-4 h-4 text-purple-600" />
            )}
            Scan Replies
          </button>

          {selectedContactIds.length > 0 && (
            <button
              onClick={handleCreateCampaignFromSelected}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              Create Campaign ({selectedContactIds.length})
            </button>
          )}

          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload PDF
          </button>
        </div>
      </div>

      {/* Reply Check Feedback Banner */}
      {replyFeedback && (
        <div className="p-3 bg-purple-50 border border-purple-200 text-purple-800 text-xs rounded-xl flex items-center justify-between font-medium shadow-2xs">
          <span>{replyFeedback}</span>
          <button onClick={() => setReplyFeedback(null)} className="text-purple-600 hover:text-purple-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Toolbar - Search & Status Filter */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts by name, email, company, or role..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="ready">Ready</option>
            <option value="sent">Sent</option>
            <option value="follow_up_pending">Follow-up Pending</option>
            <option value="replied">Replied</option>
            <option value="bounced">Bounced</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Contacts Table View */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs font-medium">Loading contacts...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-rose-600 text-xs font-medium flex flex-col items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No contacts in directory</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery || statusFilter
              ? 'No contacts match your filter criteria.'
              : 'Add contacts manually or upload a PDF document containing contact details.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              Add Manual Entry
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Upload PDF
            </button>
          </div>
        </div>
      ) : (
        <ContactReviewTable
          contacts={contacts}
          onUpdateContact={handleUpdateContact}
          onDeleteContact={handleDeleteContact}
          onBulkDelete={handleBulkDelete}
          onSelectionChange={setSelectedContactIds}
          onViewActivity={(contact) => setSelectedContactForActivity(contact)}
        />
      )}

      {/* MANUAL ENTRY CONTACT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddContactSubmit}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600" /> Add Contact Details Manually
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={addForm.company}
                    onChange={(e) => setAddForm({ ...addForm, company: e.target.value })}
                    placeholder="e.g. ABC Technologies"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Role / Title</label>
                  <input
                    type="text"
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    placeholder="e.g. Software Engineer Intern"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                  >
                    <option value="ready">ready</option>
                    <option value="pending">pending</option>
                    <option value="sent">sent</option>
                    <option value="follow_up_pending">follow_up_pending</option>
                    <option value="replied">replied</option>
                  </select>
                </div>
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Contact
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contact Engagement Activity Modal */}
      <ContactActivityModal
        contact={selectedContactForActivity}
        isOpen={Boolean(selectedContactForActivity)}
        onClose={() => setSelectedContactForActivity(null)}
      />
    </div>
  );
}
