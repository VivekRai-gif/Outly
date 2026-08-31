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
    navigate('/dashboard/campaigns/new', {
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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#FBFBFC]">Contacts Directory</h2>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Manage your verified outreach contacts, edit details, add manual entries, and track recipient statuses.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="primary-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold"
          >
            <UserPlus className="w-4 h-4" />
            Add Manual Entry
          </button>

          <button
            onClick={handleCheckReplies}
            disabled={checkingRepliesState}
            className="secondary-btn inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
            title="Scan Gmail Inbox for incoming replies"
          >
            {checkingRepliesState ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <MailCheck className="w-4 h-4 text-white" />
            )}
            Scan Replies
          </button>

          {selectedContactIds.length > 0 && (
            <button
              onClick={handleCreateCampaignFromSelected}
              className="primary-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
            >
              <Send className="w-4 h-4" />
              Create Campaign ({selectedContactIds.length})
            </button>
          )}

          <button
            onClick={() => navigate('/dashboard/upload')}
            className="secondary-btn inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            Upload PDF
          </button>
        </div>
      </div>

      {/* Reply Check Feedback Banner */}
      {replyFeedback && (
        <div className="p-3.5 bg-[#1A1B1A] border border-white/20 text-white text-xs rounded-xl flex items-center justify-between font-medium">
          <span>{replyFeedback}</span>
          <button onClick={() => setReplyFeedback(null)} className="text-white hover:underline font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Toolbar - Search & Status Filter */}
      <div className="bg-[#0E0E0E] rounded-2xl p-4 border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts by name, email, company, or role..."
            className="w-full pl-9 pr-4 py-2 bg-[#1A1B1A] border border-white/10 rounded-xl text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white/30"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#71717A] shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-[#1A1B1A] border border-white/10 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-white/30"
          >
            <option value="" className="bg-[#1A1B1A] text-white">All Statuses</option>
            <option value="pending" className="bg-[#1A1B1A] text-white">Pending</option>
            <option value="ready" className="bg-[#1A1B1A] text-white">Ready</option>
            <option value="sent" className="bg-[#1A1B1A] text-white">Sent</option>
            <option value="follow_up_pending" className="bg-[#1A1B1A] text-white">Follow-up Pending</option>
            <option value="replied" className="bg-[#1A1B1A] text-white">Replied</option>
            <option value="bounced" className="bg-[#1A1B1A] text-white">Bounced</option>
            <option value="failed" className="bg-[#1A1B1A] text-white">Failed</option>
          </select>
        </div>
      </div>

      {/* Contacts Table View */}
      {loading ? (
        <div className="bg-[#0E0E0E] rounded-2xl border border-white/10 p-12 text-center text-[#71717A] flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
          <span className="text-xs font-medium">Loading contacts...</span>
        </div>
      ) : error ? (
        <div className="bg-[#0E0E0E] rounded-2xl border border-white/10 p-8 text-center text-white text-xs font-medium flex flex-col items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-[#0E0E0E] rounded-2xl border border-white/10 shadow-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto border border-white/15">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#FBFBFC]">No contacts in directory</h3>
          <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
            {searchQuery || statusFilter
              ? 'No contacts match your filter criteria.'
              : 'Add contacts manually or upload a PDF document containing contact details.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="primary-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
            >
              <UserPlus className="w-4 h-4" />
              Add Manual Entry
            </button>
            <button
              onClick={() => navigate('/dashboard/upload')}
              className="secondary-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddContactSubmit}
            className="bg-[#0E0E0E] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-white/10"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-[#FBFBFC] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-white" /> Add Contact Details Manually
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#A1A1AA] mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 bg-[#1A1B1A] border border-white/10 text-white rounded-xl focus:outline-none focus:border-white/30"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#A1A1AA] mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-3 py-2 bg-[#1A1B1A] border border-white/10 text-white rounded-xl focus:outline-none focus:border-white/30 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#A1A1AA] mb-1">Company</label>
                  <input
                    type="text"
                    value={addForm.company}
                    onChange={(e) => setAddForm({ ...addForm, company: e.target.value })}
                    placeholder="e.g. ABC Technologies"
                    className="w-full px-3 py-2 bg-[#1A1B1A] border border-white/10 text-white rounded-xl focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#A1A1AA] mb-1">Job Role / Title</label>
                  <input
                    type="text"
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    placeholder="e.g. Software Engineer Intern"
                    className="w-full px-3 py-2 bg-[#1A1B1A] border border-white/10 text-white rounded-xl focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#A1A1AA] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-3 py-2 bg-[#1A1B1A] border border-white/10 text-white rounded-xl focus:outline-none focus:border-white/30 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#A1A1AA] mb-1">Status</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1A1B1A] border border-white/10 text-white rounded-xl focus:outline-none focus:border-white/30 font-medium"
                  >
                    <option value="ready" className="bg-[#1A1B1A] text-white">ready</option>
                    <option value="pending" className="bg-[#1A1B1A] text-white">pending</option>
                    <option value="sent" className="bg-[#1A1B1A] text-white">sent</option>
                    <option value="follow_up_pending" className="bg-[#1A1B1A] text-white">follow_up_pending</option>
                    <option value="replied" className="bg-[#1A1B1A] text-white">replied</option>
                  </select>
                </div>
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
