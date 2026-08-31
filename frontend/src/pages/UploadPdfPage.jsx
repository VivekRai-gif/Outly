import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
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
      navigate('/dashboard/contacts');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save confirmed contacts.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#FBFBFC]">PDF Contact Extractor</h2>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Upload PDF documents containing contact lists or add contact details manually.
          </p>
        </div>

        <button
          onClick={() => setIsAddRowModalOpen(true)}
          className="primary-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add Manual Contact
        </button>
      </div>

      {/* Alert Banners */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#1A1B1A] border border-white/20 text-white text-xs flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-white hover:underline font-bold">
            Dismiss
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#1A1B1A] border border-white/20 text-white text-xs flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-white hover:underline font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Dropzone (#1A1B1A Surface) */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-[#1A1B1A] rounded-3xl p-10 border-2 border-dashed text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-white bg-[#262626] scale-[0.99]'
            : 'border-white/15 hover:border-white/30 hover:bg-[#262626] shadow-2xl'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-2xl bg-white/10 text-white border border-white/15 flex items-center justify-center mx-auto mb-4">
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          ) : (
            <UploadCloud className="w-6 h-6 text-white" />
          )}
        </div>

        {isUploading ? (
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#FBFBFC]">
              {isExtracting ? 'Extracting contact records from PDF...' : 'Uploading PDF document...'}
            </h3>
            <div className="w-48 bg-[#262626] rounded-full h-2 mx-auto overflow-hidden">
              <div
                className="bg-white h-2 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-[#71717A] font-mono">{uploadProgress}%</span>
          </div>
        ) : (
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[#FBFBFC]">
              Drag & Drop your PDF file here, or <span className="text-white underline font-semibold">Browse</span>
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              Supports <strong className="text-white">.pdf</strong> files up to 10MB. Safely parsed server-side.
            </p>
          </div>
        )}
      </div>

      {/* Review Section & Table (#0E0E0E Container) */}
      {extractedContacts.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0E0E0E] rounded-2xl p-4 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-white shrink-0" />
              <span className="text-xs font-bold text-[#FBFBFC]">
                Review Extracted Contacts ({extractedContacts.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddRowModalOpen(true)}
                className="secondary-btn px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add Row
              </button>

              <button
                onClick={handleConfirmAndSave}
                disabled={isSaving}
                className="primary-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddManualRow}
            className="bg-[#0E0E0E] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-white/10"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-[#FBFBFC] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-white" /> Add Manual Contact Details
              </h3>
              <button
                type="button"
                onClick={() => setIsAddRowModalOpen(false)}
                className="p-1 text-[#71717A] hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Full Name *</label>
                <input
                  type="text"
                  value={rowForm.name}
                  onChange={(e) => setRowForm({ ...rowForm, name: e.target.value })}
                  placeholder="e.g. Priya Patel"
                  className="w-full px-3 py-2 bg-[#1A1B1A] border border-white/10 text-white rounded-xl focus:outline-none focus:border-white/30"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Email Address *</label>
                <input
                  type="email"
                  value={rowForm.email}
                  onChange={(e) => setRowForm({ ...rowForm, email: e.target.value })}
                  placeholder="e.g. priya@example.com"
                  className="w-full px-3 py-2 bg-[#1A1B1A] border border-white/10 text-white rounded-xl focus:outline-none focus:border-white/30 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Company</label>
                <input
                  type="text"
                  value={rowForm.company}
                  onChange={(e) => setRowForm({ ...rowForm, company: e.target.value })}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-3 py-2 bg-[#1A1B1A] border border-white/10 text-white rounded-xl focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#A1A1AA] mb-1">Job Role / Title</label>
                <input
                  type="text"
                  value={rowForm.role}
                  onChange={(e) => setRowForm({ ...rowForm, role: e.target.value })}
                  placeholder="e.g. Product Manager"
                  className="w-full px-3 py-2 bg-[#1A1B1A] border border-white/10 text-white rounded-xl focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAddRowModalOpen(false)}
                className="secondary-btn px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
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
