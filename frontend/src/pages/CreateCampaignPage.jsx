import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  Send, 
  Users, 
  FileText, 
  Eye, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  AlertCircle, 
  Loader2,
  Tag
} from 'lucide-react';
import { getContacts, createCampaign, getCampaignById, updateCampaign } from '../services/api';
import EmailComposer from '../components/EmailComposer';
import { renderTemplate } from '../utils/templateEngine';

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  // Active Wizard Tab ('details' | 'composer' | 'followups')
  const [activeTab, setActiveTab] = useState('details');

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Application for {{role}} at {{company}}');
  const [body, setBody] = useState(`Hi {{name}},

I am reaching out regarding the {{role}} opportunity at {{company}}.

I would appreciate the opportunity to connect.

Regards,
Vivek Rai`);
  const [status, setStatus] = useState('draft');
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [followUps, setFollowUps] = useState([
    {
      delayDays: 3,
      subject: 'Following up regarding {{role}} at {{company}}',
      body: `Hi {{name}},\n\nI wanted to check in regarding my previous email about the {{role}} role at {{company}}.\n\nBest,\nVivek Rai`,
    },
  ]);

  // Loading & Data States
  const [availableContacts, setAvailableContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchAvailableContacts();
    if (isEditMode) {
      fetchCampaignDetails(id);
    } else {
      if (location.state?.selectedContactIds) {
        setSelectedContactIds(location.state.selectedContactIds);
      }
      if (location.state?.templateSubject) {
        setSubject(location.state.templateSubject);
      }
      if (location.state?.templateBody) {
        setBody(location.state.templateBody);
      }
      if (location.state?.templateTitle) {
        setName(location.state.templateTitle);
      }
    }
  }, [id, location.state]);

  const fetchAvailableContacts = async () => {
    setLoadingContacts(true);
    try {
      const data = await getContacts({ limit: 200 });
      setAvailableContacts(data.contacts || []);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchCampaignDetails = async (campaignId) => {
    try {
      const data = await getCampaignById(campaignId);
      const c = data.campaign;
      setName(c.name || '');
      setDescription(c.description || '');
      setSubject(c.subject || '');
      setBody(c.body || '');
      setStatus(c.status || 'draft');
      setFollowUps(c.followUps || []);
      if (Array.isArray(c.contacts)) {
        setSelectedContactIds(c.contacts.map(item => typeof item === 'object' ? item._id : item));
      }
    } catch (err) {
      setErrorMsg('Failed to load campaign details');
    }
  };

  const handleToggleContact = (contactId) => {
    setSelectedContactIds(prev => 
      prev.includes(contactId) ? prev.filter(i => i !== contactId) : [...prev, contactId]
    );
  };

  const handleSelectAllContacts = () => {
    if (selectedContactIds.length === availableContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(availableContacts.map(c => c._id));
    }
  };

  // Follow-up Step Handlers
  const handleAddFollowUp = () => {
    const lastDelay = followUps.length > 0 ? followUps[followUps.length - 1].delayDays : 0;
    setFollowUps(prev => [
      ...prev,
      {
        delayDays: lastDelay + 4,
        subject: 'Re: ' + (subject || 'Outreach'),
        body: `Hi {{name}},\n\nFollowing up to see if you had a chance to review my message.\n\nBest,\nVivek Rai`,
      },
    ]);
  };

  const handleRemoveFollowUp = (index) => {
    setFollowUps(prev => prev.filter((_, i) => i !== index));
  };

  const handleFollowUpChange = (index, field, value) => {
    setFollowUps(prev => {
      const next = [...prev];
      next[index][field] = value;
      return next;
    });
  };

  const handleSaveCampaign = async (desiredStatus = 'draft') => {
    if (!name.trim()) {
      setErrorMsg('Please enter a campaign name.');
      setActiveTab('details');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const payload = {
      name: name.trim(),
      description,
      subject,
      body,
      status: desiredStatus,
      contacts: selectedContactIds,
      followUps,
    };

    try {
      if (isEditMode) {
        await updateCampaign(id, payload);
      } else {
        await createCampaign(payload);
      }
      setSaving(false);
      navigate('/campaigns');
    } catch (err) {
      setSaving(false);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save campaign');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/campaigns')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditMode ? 'Edit Campaign' : 'Create New Campaign'}
            </h2>
            <p className="text-sm text-slate-500">
              Configure outreach templates, personalized variables, target recipients, and follow-up schedules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => handleSaveCampaign('draft')}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-slate-500" />}
            Save as Draft
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Tabs Header */}
      <div className="bg-white rounded-xl p-1.5 border border-slate-200/80 shadow-xs flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'details', label: '1. Setup & Recipients', icon: Users, badge: selectedContactIds.length },
          { id: 'composer', label: '2. Email Composer & Preview', icon: FileText },
          { id: 'followups', label: '3. Follow-up Sequence', icon: Clock, badge: followUps.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Setup & Recipients */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Campaign Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. August Software Intern Outreach"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="running">Running</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Internal campaign description and goals..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Recipients Selection */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Target Recipients</h3>
                <p className="text-xs text-slate-500">Select contacts from your directory to include in this campaign.</p>
              </div>
              <button
                onClick={handleSelectAllContacts}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                {selectedContactIds.length === availableContacts.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {loadingContacts ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading contacts directory...</div>
            ) : availableContacts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No saved contacts found. Upload a PDF or add contacts first.
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
                {availableContacts.map((contact) => {
                  const isChecked = selectedContactIds.includes(contact._id);
                  return (
                    <div
                      key={contact._id}
                      onClick={() => handleToggleContact(contact._id)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${isChecked ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <span className="font-semibold text-xs text-slate-900 block">{contact.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{contact.email}</span>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500">
                        <span>{contact.company || 'No Company'}</span>
                        <span className="block text-slate-400">{contact.role || 'No Role'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Reusable Email Composer */}
      {activeTab === 'composer' && (
        <EmailComposer
          subject={subject}
          body={body}
          onSubjectChange={setSubject}
          onBodyChange={setBody}
          contacts={availableContacts.filter(c => selectedContactIds.length === 0 || selectedContactIds.includes(c._id))}
        />
      )}

      {/* TAB 3: Follow-up Sequence */}
      {activeTab === 'followups' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Follow-up Sequence Configurator</h3>
              <p className="text-xs text-slate-500">Configure automated follow-ups sent when a recipient does not reply.</p>
            </div>
            <button
              type="button"
              onClick={handleAddFollowUp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Follow-up Step
            </button>
          </div>

          {followUps.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-xs text-slate-400 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700">No follow-ups configured</p>
              <p>Add follow-up steps to automate non-reply check sequences.</p>
            </div>
          ) : (
            followUps.map((step, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs text-slate-800">Follow-up Step #{idx + 1}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFollowUp(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Delay (Days after initial)</label>
                    <input
                      type="number"
                      min={1}
                      value={step.delayDays}
                      onChange={(e) => handleFollowUpChange(idx, 'delayDays', parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Subject</label>
                    <input
                      type="text"
                      value={step.subject}
                      onChange={(e) => handleFollowUpChange(idx, 'subject', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Body</label>
                  <textarea
                    rows={3}
                    value={step.body}
                    onChange={(e) => handleFollowUpChange(idx, 'body', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
