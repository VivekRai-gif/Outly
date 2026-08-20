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
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  sent: 'bg-blue-50 text-blue-700 border-blue-200',
  follow_up_pending: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  replied: 'bg-purple-50 text-purple-700 border-purple-200',
  bounced: 'bg-rose-50 text-rose-700 border-rose-200',
  completed: 'bg-teal-50 text-teal-700 border-teal-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
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
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden space-y-0">
      {/* Header Banner with Selection Stats */}
      <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {readyCount} contacts ready
          </span>
          {selectedIds.length > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              {selectedIds.length} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => onBulkDelete && onBulkDelete(selectedIds)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedIds.length})
            </button>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search table..."
              className="pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-44"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === filteredContacts.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="p-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort('email')}>
                <div className="flex items-center gap-1">
                  <span>Email</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort('company')}>
                <div className="flex items-center gap-1">
                  <span>Company</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort('role')}>
                <div className="flex items-center gap-1">
                  <span>Role</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedContacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
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
                      isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </td>

                    {/* Name */}
                    <td className="p-3 font-semibold text-slate-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        contact.name || '—'
                      )}
                    </td>

                    {/* Email */}
                    <td className="p-3 font-mono text-slate-700">
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className={`w-full px-2 py-1 bg-white border rounded text-xs ${
                            isValidEmail(editForm.email) ? 'border-slate-300' : 'border-rose-500'
                          }`}
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span>{contact.email}</span>
                          {!emailValid && (
                            <span title="Invalid Email Format">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                            </span>
                          )}
                          {isDuplicate && (
                            <span title="Duplicate Email Warning">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Company */}
                    <td className="p-3 text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.company || ''}
                          onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        contact.company || '—'
                      )}
                    </td>

                    {/* Role */}
                    <td className="p-3 text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.role || ''}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
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
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            STATUS_BADGES[contact.status] || 'bg-slate-100 text-slate-700'
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
                            className="p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded"
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
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View Activity Timeline"
                            >
                              <Activity className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleStartEdit(contact)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteContact && onDeleteContact(contact._id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
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
