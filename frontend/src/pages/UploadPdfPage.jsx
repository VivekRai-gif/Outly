import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  ShieldAlert,
  FileText,
  UserPlus,
  X,
  Check
} from 'lucide-react';
import { uploadPdf, bulkSaveContacts } from '../services/api';
import ContactReviewTable from '../components/ContactReviewTable';

export default function UploadPdfPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Processing states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Extracted contacts draft list for review
  const [extractedContacts, setExtractedContacts] = useState([]);
  const [sourceFileName, setSourceFileName] = useState('');

  // Manual row state for review table
  const [isAddRowModalOpen, setIsAddRowModalOpen] = useState(false);
  const [rowForm, setRowForm] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    status: 'ready',
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (file.type !== 'application/pdf') {
      setErrorMsg('Only PDF files (application/pdf) are supported.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 10MB limit.');
      return;
    }

    setSelectedFile(file);
    processPdfUpload(file);
  };

  const processPdfUpload = async (file) => {
    setIsUploading(true);
    setIsExtracting(false);
    setUploadProgress(0);
    setErrorMsg(null);

    try {
      setIsExtracting(true);
      const res = await uploadPdf(file, (progress) => {
        setUploadProgress(progress);
      });

      setExtractedContacts(res.contacts || []);
      setSourceFileName(res.file?.originalName || file.name);
      setSuccessMsg(`Extracted ${res.totalFound || 0} contact records from "${file.name}".`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to extract text from PDF.');
    } finally {
      setIsUploading(false);
      setIsExtracting(false);
    }
  };

  const handleUpdateContact = (id, updatedFields) => {
    setExtractedContacts((prev) =>
      prev.map((c) => {
        const cId = c._id || c.email;
        return cId === id ? { ...c, ...updatedFields } : c;
      })
    );
  };

  const handleDeleteContact = (id) => {
    setExtractedContacts((prev) =>
      prev.filter((c) => (c._id || c.email) !== id)
    );
  };

  const handleBulkDelete = (idsToDelete) => {
    setExtractedContacts((prev) =>
      prev.filter((c) => !idsToDelete.includes(c._id || c.email))
    );
  };

  const handleAddManualRow = (e) => {
    e.preventDefault();
    if (!rowForm.name || !rowForm.email) {
      alert('Name and Email are required.');
      return;
    }

    const newContact = {
      _id: `manual_${Date.now()}`,
      name: rowForm.name.trim(),
      email: rowForm.email.trim(),
      company: rowForm.company.trim(),
      role: rowForm.role.trim(),
      status: rowForm.status || 'ready',
      sourceFile: 'Manual Entry',
    };

    setExtractedContacts((prev) => [newContact, ...prev]);
    setIsAddRowModalOpen(false);
    setRowForm({ name: '', email: '', company: '', role: '', status: 'ready' });
  };

  const handleConfirmAndSave = async () => {
    if (extractedContacts.length === 0) return;

    setIsSaving(true);
    setErrorMsg(null);
    try {
      const contactsToSave = extractedContacts.map((c) => ({
        ...c,
        sourceFile: sourceFileName || c.sourceFile || 'PDF Upload',
      }));

      const res = await bulkSaveContacts(contactsToSave);
      alert(`Successfully saved ${res.count} contacts to your directory!`);
      navigate('/contacts');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save confirmed contacts.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">PDF Contact Extractor</h2>
          <p className="text-sm text-slate-500 mt-1">
            Upload PDF documents containing contact lists or add contact details manually.
          </p>
        </div>

        <button
          onClick={() => setIsAddRowModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add Manual Contact
        </button>
      </div>

      {/* Alert Banners */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-white rounded-2xl p-8 border-2 border-dashed text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
            : 'border-slate-200/80 hover:border-blue-400 hover:bg-slate-50/50 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>

        {isUploading ? (
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-800">
              {isExtracting ? 'Extracting contact records from PDF...' : 'Uploading PDF document...'}
            </h3>
            <div className="w-48 bg-slate-100 rounded-full h-2 mx-auto overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">{uploadProgress}%</span>
          </div>
        ) : (
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-800">
              Drag & Drop your PDF file here, or <span className="text-blue-600 underline">Browse</span>
            </h3>
            <p className="text-xs text-slate-400">
              Supports <strong className="text-slate-600">.pdf</strong> files up to 10MB. Safely parsed server-side.
            </p>
          </div>
        )}
      </div>

      {/* Review Section & Table */}
      {extractedContacts.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-slate-900">
                Review Extracted Contacts ({extractedContacts.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddRowModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add Row
              </button>

              <button
                onClick={handleConfirmAndSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirm & Save Contacts ({extractedContacts.length})
              </button>
            </div>
          </div>

          <ContactReviewTable
            contacts={extractedContacts}
            onUpdateContact={handleUpdateContact}
            onDeleteContact={handleDeleteContact}
            onBulkDelete={handleBulkDelete}
          />
        </div>
      )}

      {/* ADD MANUAL ROW MODAL */}
      {isAddRowModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddManualRow}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600" /> Add Manual Contact Details
              </h3>
              <button
                type="button"
                onClick={() => setIsAddRowModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={rowForm.name}
                  onChange={(e) => setRowForm({ ...rowForm, name: e.target.value })}
                  placeholder="e.g. Priya Patel"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={rowForm.email}
                  onChange={(e) => setRowForm({ ...rowForm, email: e.target.value })}
                  placeholder="e.g. priya@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company</label>
                <input
                  type="text"
                  value={rowForm.company}
                  onChange={(e) => setRowForm({ ...rowForm, company: e.target.value })}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Role / Title</label>
                <input
                  type="text"
                  value={rowForm.role}
                  onChange={(e) => setRowForm({ ...rowForm, role: e.target.value })}
                  placeholder="e.g. Product Manager"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddRowModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
              >
                <Check className="w-4 h-4" /> Add to Table
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
