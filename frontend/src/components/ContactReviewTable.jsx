import React, { useState } from 'react';
import { 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  AlertTriangle, 
  Search, 
  ArrowUpDown, 
  AlertCircle,
  Activity
} from 'lucide-react';

const STATUS_OPTIONS = [
  'pending',
  'ready',
  'sent',
  'follow_up_pending',
  'replied',
  'bounced',
  'completed',
  'failed',
];

const STATUS_BADGES = {
  pending: 'bg-white/10 text-white border-white/15',
  ready: 'bg-white text-black font-bold border-white',
  sent: 'bg-white/10 text-white border-white/15',
  follow_up_pending: 'bg-white/10 text-white border-white/15',
  replied: 'bg-white text-black font-bold border-white',
  bounced: 'bg-white/10 text-white border-white/15',
  completed: 'bg-white/10 text-white border-white/15',
  failed: 'bg-white/10 text-white border-white/15',
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function ContactReviewTable({
  contacts = [],
  onUpdateContact,
  onDeleteContact,
  onBulkDelete,
  onSelectionChange,
  onViewActivity,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Find duplicate emails
  const emailCounts = contacts.reduce((acc, c) => {
    const email = (c.email || '').toLowerCase();
    acc[email] = (acc[email] || 0) + 1;
    return acc;
  }, {});

  // Select all / Deselect all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredContacts.map((c) => c._id || c.email);
      setSelectedIds(allIds);
      if (onSelectionChange) onSelectionChange(allIds);
    } else {
      setSelectedIds([]);
      if (onSelectionChange) onSelectionChange([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      if (onSelectionChange) onSelectionChange(updated);
      return updated;
    });
  };

  const handleStartEdit = (contact) => {
    setEditingId(contact._id || contact.email);
    setEditForm({ ...contact });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = (contactId) => {
    if (!isValidEmail(editForm.email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (onUpdateContact) {
      onUpdateContact(contactId, editForm);
    }
    setEditingId(null);
  };

  // Sorting and Filtering
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query) ||
      (c.company || '').toLowerCase().includes(query) ||
      (c.role || '').toLowerCase().includes(query)
    );
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    const valA = (a[sortField] || '').toString().toLowerCase();
    const valB = (b[sortField] || '').toString().toLowerCase();
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const readyCount = contacts.filter((c) => isValidEmail(c.email)).length;

  return (
    <div className="bg-[#0E0E0E] rounded-2xl border border-white/10 shadow-2xl overflow-hidden space-y-0">
      {/* Header Banner with Selection Stats */}
      <div className="p-4 bg-[#1A1B1A] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full font-bold bg-white/10 text-white border border-white/15">
            {readyCount} contacts ready
          </span>
          {selectedIds.length > 0 && (
            <span className="px-2.5 py-1 rounded-full font-bold bg-white text-black border border-white">
              {selectedIds.length} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => onBulkDelete && onBulkDelete(selectedIds)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedIds.length})
            </button>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search table..."
              className="pl-8 pr-3 py-1 bg-[#1A1B1A] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-white/30 w-44"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#1A1B1A] border-b border-white/10 text-[#A1A1AA] font-semibold uppercase tracking-wider text-[11px]">
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === filteredContacts.length}
                  onChange={handleSelectAll}
                  className="rounded border-white/20 text-white focus:ring-white w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>Name</span>
                  <ArrowUpDown className="w-3 h-3 text-[#71717A]" />
                </div>
              </th>
              <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('email')}>
                <div className="flex items-center gap-1">
                  <span>Email</span>
                  <ArrowUpDown className="w-3 h-3 text-[#71717A]" />
                </div>
              </th>
              <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('company')}>
                <div className="flex items-center gap-1">
                  <span>Company</span>
                  <ArrowUpDown className="w-3 h-3 text-[#71717A]" />
                </div>
              </th>
              <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('role')}>
                <div className="flex items-center gap-1">
                  <span>Role</span>
                  <ArrowUpDown className="w-3 h-3 text-[#71717A]" />
                </div>
              </th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sortedContacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#71717A] font-medium">
                  No contacts found in review table.
                </td>
              </tr>
            ) : (
              sortedContacts.map((contact) => {
                const id = contact._id || contact.email;
                const isEditing = editingId === id;
                const isSelected = selectedIds.includes(id);
                const emailValid = isValidEmail(contact.email);
                const isDuplicate = emailCounts[(contact.email || '').toLowerCase()] > 1;

                return (
                  <tr
                    key={id}
                    className={`transition-colors ${
                      isSelected ? 'bg-[#262626]' : 'hover:bg-[#262626]'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(id)}
                        className="rounded border-white/20 text-white focus:ring-white w-4 h-4 cursor-pointer"
                      />
                    </td>

                    {/* Name */}
                    <td className="p-3 font-semibold text-[#FBFBFC]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-2 py-1 bg-[#262626] border border-white/20 rounded text-xs text-white"
                        />
                      ) : (
                        contact.name || '—'
                      )}
                    </td>

                    {/* Email */}
                    <td className="p-3 font-mono text-[#A1A1AA]">
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className={`w-full px-2 py-1 bg-[#262626] border rounded text-xs text-white ${
                            isValidEmail(editForm.email) ? 'border-white/20' : 'border-white'
                          }`}
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span>{contact.email}</span>
                          {!emailValid && (
                            <span title="Invalid Email Format">
                              <AlertCircle className="w-3.5 h-3.5 text-white" />
                            </span>
                          )}
                          {isDuplicate && (
                            <span title="Duplicate Email Warning">
                              <AlertTriangle className="w-3.5 h-3.5 text-white" />
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Company */}
                    <td className="p-3 text-[#A1A1AA]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.company || ''}
                          onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                          className="w-full px-2 py-1 bg-[#262626] border border-white/20 rounded text-xs text-white"
                        />
                      ) : (
                        contact.company || '—'
                      )}
                    </td>

                    {/* Role */}
                    <td className="p-3 text-[#A1A1AA]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.role || ''}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="w-full px-2 py-1 bg-[#262626] border border-white/20 rounded text-xs text-white"
                        />
                      ) : (
                        contact.role || '—'
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      {isEditing ? (
                        <select
                          value={editForm.status || 'ready'}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="px-2 py-1 bg-[#262626] border border-white/20 rounded text-xs text-white"
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st} className="bg-[#1A1B1A] text-white">
                              {st}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            STATUS_BADGES[contact.status] || 'bg-white/10 text-white border-white/15'
                          }`}
                        >
                          {contact.status || 'ready'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSaveEdit(contact._id)}
                            className="p-1 bg-white text-black hover:bg-[#F5F5F5] rounded"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 bg-[#262626] text-white hover:bg-white/10 rounded"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          {onViewActivity && (
                            <button
                              onClick={() => onViewActivity(contact)}
                              className="p-1 text-[#71717A] hover:text-white hover:bg-white/10 rounded transition-colors"
                              title="View Activity Timeline"
                            >
                              <Activity className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleStartEdit(contact)}
                            className="p-1 text-[#71717A] hover:text-white hover:bg-white/10 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteContact && onDeleteContact(contact._id)}
                            className="p-1 text-[#71717A] hover:text-white hover:bg-white/10 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
