import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  Send, 
  Users, 
  FileText, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  AlertCircle, 
  Loader2
} from 'lucide-react';
import { getContacts, createCampaign, getCampaignById, updateCampaign } from '../services/api';
import EmailComposer from '../components/EmailComposer';

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
      navigate('/dashboard/campaigns');
    } catch (err) {
      setSaving(false);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save campaign');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/campaigns')}
            className="p-2 text-[#71717A] hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-[#FBFBFC]">
              {isEditMode ? 'Edit Campaign' : 'Create New Campaign'}
            </h2>
            <p className="text-xs text-[#A1A1AA]">
              Configure outreach templates, personalized variables, target recipients, and follow-up schedules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => handleSaveCampaign('draft')}
            disabled={saving}
            className="secondary-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-white" />}
            Save as Draft
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#1A1B1A] border border-white/20 text-white text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-white shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Tabs Header */}
      <div className="bg-[#0E0E0E] rounded-2xl p-1.5 border border-white/10 shadow-2xl flex items-center gap-1 overflow-x-auto">
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
                flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                ${isActive 
                  ? 'bg-white text-black font-bold shadow-2xs' 
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/10'}
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? 'bg-black text-white' : 'bg-[#262626] text-white border border-white/10'}`}>
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
          <div className="bg-[#1A1B1A] rounded-2xl p-6 border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#FBFBFC] border-b border-white/10 pb-3">
              Campaign Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Campaign Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. August Software Intern Outreach"
                  className="w-full px-3 py-2 bg-[#0E0E0E] border border-white/10 rounded-xl text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0E0E0E] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-white/30"
                >
                  <option value="draft" className="bg-[#1A1B1A] text-white">Draft</option>
                  <option value="scheduled" className="bg-[#1A1B1A] text-white">Scheduled</option>
                  <option value="running" className="bg-[#1A1B1A] text-white">Running</option>
                  <option value="paused" className="bg-[#1A1B1A] text-white">Paused</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Description (Optional)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Internal campaign description and goals..."
                className="w-full px-3 py-2 bg-[#0E0E0E] border border-white/10 rounded-xl text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {/* Recipients Selection */}
          <div className="bg-[#1A1B1A] rounded-2xl p-6 border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#FBFBFC]">Target Recipients</h3>
                <p className="text-xs text-[#A1A1AA]">Select contacts from your directory to include in this campaign.</p>
              </div>
              <button
                onClick={handleSelectAllContacts}
                className="text-xs font-semibold text-white hover:underline"
              >
                {selectedContactIds.length === availableContacts.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {loadingContacts ? (
              <div className="p-8 text-center text-xs text-[#71717A]">Loading contacts directory...</div>
            ) : availableContacts.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#71717A]">
                No saved contacts found. Upload a PDF or add contacts first.
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto divide-y divide-white/10 border border-white/10 rounded-xl bg-[#0E0E0E]">
                {availableContacts.map((contact) => {
                  const isChecked = selectedContactIds.includes(contact._id);
                  return (
                    <div
                      key={contact._id}
                      onClick={() => handleToggleContact(contact._id)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${isChecked ? 'bg-[#262626]' : 'hover:bg-[#262626]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-white/20 text-white focus:ring-white w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <span className="font-semibold text-xs text-white block">{contact.name}</span>
                          <span className="text-[11px] text-[#A1A1AA] font-mono">{contact.email}</span>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-[#A1A1AA]">
                        <span>{contact.company || 'No Company'}</span>
                        <span className="block text-[#71717A]">{contact.role || 'No Role'}</span>
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
              <h3 className="text-sm font-bold text-[#FBFBFC]">Follow-up Sequence Configurator</h3>
              <p className="text-xs text-[#A1A1AA]">Configure automated follow-ups sent when a recipient does not reply.</p>
            </div>
            <button
              type="button"
              onClick={handleAddFollowUp}
              className="primary-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Follow-up Step
            </button>
          </div>

          {followUps.length === 0 ? (
            <div className="bg-[#1A1B1A] rounded-2xl p-8 border border-white/10 text-center text-xs text-[#71717A] space-y-2">
              <Clock className="w-8 h-8 mx-auto text-[#71717A]" />
              <p className="font-semibold text-[#FBFBFC]">No follow-ups configured</p>
              <p>Add follow-up steps to automate non-reply check sequences.</p>
            </div>
          ) : (
            followUps.map((step, idx) => (
              <div key={idx} className="bg-[#1A1B1A] rounded-2xl p-5 border border-white/10 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs border border-white/15">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs text-[#FBFBFC]">Follow-up Step #{idx + 1}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFollowUp(idx)}
                    className="p-1 text-[#71717A] hover:text-white rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Delay (Days after initial)</label>
                    <input
                      type="number"
                      min={1}
                      value={step.delayDays}
                      onChange={(e) => handleFollowUpChange(idx, 'delayDays', parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-1.5 bg-[#0E0E0E] border border-white/10 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Follow-up Subject</label>
                    <input
                      type="text"
                      value={step.subject}
                      onChange={(e) => handleFollowUpChange(idx, 'subject', e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#0E0E0E] border border-white/10 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Follow-up Body</label>
                  <textarea
                    rows={3}
                    value={step.body}
                    onChange={(e) => handleFollowUpChange(idx, 'body', e.target.value)}
                    className="w-full p-2.5 bg-[#0E0E0E] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-white/30"
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
