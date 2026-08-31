import React, { useState, useRef } from 'react';
import { 
  Tag, 
  Eye, 
  FileText
} from 'lucide-react';
import { renderTemplate, TEMPLATE_VARIABLES } from '../utils/templateEngine';

export default function EmailComposer({
  subject = '',
  body = '',
  onSubjectChange,
  onBodyChange,
  contacts = [],
}) {
  // Active View Mode ('split' | 'template' | 'preview')
  const [viewMode, setViewMode] = useState('split');

  // Selected contact for preview
  const [selectedContactId, setSelectedContactId] = useState(
    contacts.length > 0 ? contacts[0]._id : ''
  );

  // Active focused input reference ('subject' | 'body')
  const [lastFocusedField, setLastFocusedField] = useState('body');

  const subjectRef = useRef(null);
  const bodyRef = useRef(null);

  // Selected contact object or fallback
  const activeContact = contacts.find((c) => c._id === selectedContactId) || contacts[0] || {
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    company: 'ABC Technologies',
    role: 'Software Engineer Intern',
  };

  // Calculate text metrics
  const getMetrics = (str = '') => {
    const chars = str.length;
    const words = str.trim() ? str.trim().split(/\s+/).length : 0;
    return { chars, words };
  };

  const subjectMetrics = getMetrics(subject);
  const bodyMetrics = getMetrics(body);

  // Insert variable tag at cursor position
  const handleInsertVariable = (tag) => {
    if (lastFocusedField === 'subject' && subjectRef.current) {
      const input = subjectRef.current;
      const start = input.selectionStart || subject.length;
      const end = input.selectionEnd || subject.length;
      const updated = subject.substring(0, start) + tag + subject.substring(end);
      onSubjectChange(updated);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    } else {
      const textarea = bodyRef.current;
      if (textarea) {
        const start = textarea.selectionStart || body.length;
        const end = textarea.selectionEnd || body.length;
        const updated = body.substring(0, start) + tag + body.substring(end);
        onBodyChange(updated);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + tag.length, start + tag.length);
        }, 0);
      } else {
        onBodyChange(body + ' ' + tag);
      }
    }
  };

  // Rendered personalized preview
  const personalizedSubject = renderTemplate(subject, activeContact);
  const personalizedBody = renderTemplate(body, activeContact);

  return (
    <div className="bg-[#0E0E0E] rounded-2xl border border-white/10 shadow-2xl overflow-hidden space-y-0 text-white">
      {/* Header Toolbar */}
      <div className="p-4 bg-[#1A1B1A] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#FBFBFC] flex items-center gap-2">
            <FileText className="w-4 h-4 text-white" />
            Reusable Email Composer
          </h3>
          <p className="text-xs text-[#A1A1AA]">
            Write templates with dynamic variables and preview exact personalized outputs.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-[#262626] p-1 rounded-xl self-start sm:self-auto border border-white/10">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'split' ? 'bg-white text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Split View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('template')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'template' ? 'bg-white text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Template Only
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'preview' ? 'bg-white text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Preview Only
          </button>
        </div>
      </div>

      {/* Variable Tags Quick Bar */}
      <div className="px-4 py-2.5 bg-[#1A1B1A] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-white" /> Insert Variable:
          </span>
          {TEMPLATE_VARIABLES.map((item) => (
            <button
              key={item.tag}
              type="button"
              onClick={() => handleInsertVariable(item.tag)}
              className="px-2.5 py-1 rounded-lg bg-[#262626] hover:bg-white hover:text-black border border-white/15 text-white font-mono font-semibold transition-colors text-xs"
              title={`Click to insert ${item.label}`}
            >
              {item.tag}
            </button>
          ))}
        </div>

        {/* Preview Contact Selector */}
        {contacts.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[#A1A1AA] font-medium">Test Recipient:</span>
            <select
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="px-2.5 py-1 bg-[#262626] border border-white/10 rounded-lg text-white font-medium focus:outline-none focus:border-white/30"
            >
              {contacts.map((c) => (
                <option key={c._id} value={c._id} className="bg-[#1A1B1A] text-white">
                  {c.name} ({c.company || c.email})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Workspace Grid (Split or Single view) */}
      <div className={`grid grid-cols-1 ${viewMode === 'split' ? 'lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10' : ''}`}>
        {/* LEFT / TEMPLATE EDITOR COLUMN */}
        {(viewMode === 'split' || viewMode === 'template') && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
              <span className="font-bold text-[#FBFBFC] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-white" />
                Raw Email Template
              </span>
              <span className="text-[#71717A]">
                Body: {bodyMetrics.chars} chars | {bodyMetrics.words} words
              </span>
            </div>

            {/* Subject Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                <label className="font-semibold text-white">Subject Line</label>
                <span className="text-[11px] text-[#71717A] font-mono">
                  {subjectMetrics.chars} chars
                </span>
              </div>
              <input
                ref={subjectRef}
                type="text"
                value={subject}
                onFocus={() => setLastFocusedField('subject')}
                onChange={(e) => onSubjectChange(e.target.value)}
                placeholder="e.g. Application for {{role}} at {{company}}"
                className="w-full px-3 py-2 bg-[#1A1B1A] border border-white/10 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-white/30 placeholder:text-[#71717A]"
              />
            </div>

            {/* Body Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-white">Email Body</label>
              <textarea
                ref={bodyRef}
                rows={9}
                value={body}
                onFocus={() => setLastFocusedField('body')}
                onChange={(e) => onBodyChange(e.target.value)}
                placeholder="Write your email body here using {{name}}, {{company}}, {{role}}..."
                className="w-full p-3 bg-[#1A1B1A] border border-white/10 rounded-xl text-xs font-mono text-white leading-relaxed focus:outline-none focus:border-white/30 placeholder:text-[#71717A] resize-y"
              />
            </div>
          </div>
        )}

        {/* RIGHT / PERSONALIZED PREVIEW COLUMN */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className="p-4 space-y-4 bg-[#0E0E0E]">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
              <span className="font-bold text-[#FBFBFC] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-white" />
                Personalized Preview (As Recipient Sees It)
              </span>
              <span className="text-white font-semibold bg-white/10 px-2 py-0.5 rounded border border-white/15 text-[11px]">
                Variables Rendered
              </span>
            </div>

            {/* Recipient Header Info */}
            <div className="p-3 bg-[#1A1B1A] rounded-xl border border-white/10 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#71717A] w-14">Recipient:</span>
                <span className="font-semibold text-white">{activeContact.name} &lt;{activeContact.email}&gt;</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#71717A] w-14">Company:</span>
                <span className="text-[#A1A1AA]">{activeContact.company || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#71717A] w-14">Role:</span>
                <span className="text-[#A1A1AA]">{activeContact.role || '—'}</span>
              </div>
            </div>

            {/* Rendered Subject */}
            <div className="p-3 bg-[#1A1B1A] rounded-xl border border-white/10 space-y-1">
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider block">Rendered Subject:</span>
              <p className="text-xs font-bold text-white leading-snug">
                {personalizedSubject || <span className="text-[#71717A] italic">(Empty Subject)</span>}
              </p>
            </div>

            {/* Rendered Body */}
            <div className="p-4 bg-[#1A1B1A] rounded-xl border border-white/10 text-xs text-[#F5F5F5] leading-relaxed font-sans whitespace-pre-wrap min-h-[160px]">
              {personalizedBody || <span className="text-[#71717A] italic">(Empty Body)</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
