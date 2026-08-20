import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Mail, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Users,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { getGoogleAuthStatus, sendTestEmail, sendCampaign } from '../services/api';

export default function SendCampaignModal({ campaign, isOpen, onClose, onCampaignUpdated }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('campaign'); // 'campaign' | 'test'

  // Gmail connection state
  const [authStatus, setAuthStatus] = useState({ connected: false, email: null });
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Test email state
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testSuccessMsg, setTestSuccessMsg] = useState(null);
  const [testErrorMsg, setTestErrorMsg] = useState(null);

  // Campaign sending state
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [campaignResult, setCampaignResult] = useState(null);
  const [campaignErrorMsg, setCampaignErrorMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      checkAuth();
      setTestSuccessMsg(null);
      setTestErrorMsg(null);
      setCampaignResult(null);
      setCampaignErrorMsg(null);
    }
  }, [isOpen]);

  const checkAuth = async () => {
    setCheckingAuth(true);
    try {
      const status = await getGoogleAuthStatus();
      setAuthStatus(status);
    } catch (err) {
      setAuthStatus({ connected: false, email: null });
    } finally {
      setCheckingAuth(false);
    }
  };

  if (!isOpen || !campaign) return null;

  const recipientCount = Array.isArray(campaign.contacts) ? campaign.contacts.length : 0;

  // Handle Test Email Dispatch
  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      setTestErrorMsg('Please enter a valid recipient email address.');
      return;
    }

    setSendingTest(true);
    setTestSuccessMsg(null);
    setTestErrorMsg(null);

    try {
      const res = await sendTestEmail({
        recipientEmail: testEmailAddress,
        subject: campaign.subject,
        body: campaign.body,
      });

      setSendingTest(false);
      setTestSuccessMsg(`Test email sent successfully to ${testEmailAddress}! (Message ID: ${res.messageId})`);
    } catch (err) {
      setSendingTest(false);
      setTestErrorMsg(err.response?.data?.message || err.message || 'Failed to send test email.');
    }
  };

  // Handle Campaign Dispatch
  const handleLaunchCampaign = async () => {
    setSendingCampaign(true);
    setCampaignResult(null);
    setCampaignErrorMsg(null);

    try {
      const result = await sendCampaign(campaign._id);
      setSendingCampaign(false);
      setCampaignResult(result);
      if (onCampaignUpdated) {
        onCampaignUpdated();
      }
    } catch (err) {
      setSendingCampaign(false);
      setCampaignErrorMsg(err.response?.data?.message || err.message || 'Failed to dispatch campaign.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Email Dispatch Control</h3>
              <p className="text-xs text-slate-400">Launch outreach campaign or send test email</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Connection Banner */}
        {checkingAuth ? (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            Checking Gmail OAuth connection status...
          </div>
        ) : !authStatus.connected ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Gmail Account Not Connected
            </div>
            <p className="text-amber-700 leading-relaxed">
              Outly requires an authorized Gmail OAuth connection to send emails. Please connect your account in Settings.
            </p>
            <button
              onClick={() => {
                onClose();
                navigate('/settings');
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold shadow-xs hover:bg-amber-700 transition-colors mt-1"
            >
              Go to Settings & Connect Gmail →
            </button>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sender Account: <strong className="font-mono text-slate-900">{authStatus.email}</strong></span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              Ready
            </span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('campaign')}
            className={`flex-1 py-1.5 rounded transition-all ${
              activeTab === 'campaign' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Launch Campaign ({recipientCount})
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`flex-1 py-1.5 rounded transition-all ${
              activeTab === 'test' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Send Test Email
          </button>
        </div>

        {/* TAB 1: Campaign Launch Confirmation */}
        {activeTab === 'campaign' && (
          <div className="space-y-4 text-xs">
            {campaignResult ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Campaign Execution Finished!
                </div>
                <p className="text-emerald-700 leading-relaxed">
                  {campaignResult.message}
                </p>
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-emerald-900 font-mono text-[11px]">
                  <span>Sent: <strong>{campaignResult.sentCount}</strong></span>
                  <span>Skipped: <strong>{campaignResult.skippedCount}</strong></span>
                  <span>Failed: <strong>{campaignResult.failedCount}</strong></span>
                </div>
              </div>
            ) : (
              <>
                {campaignErrorMsg && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{campaignErrorMsg}</span>
                  </div>
                )}

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Campaign: {campaign.name}</span>
                    <span className="text-blue-600 font-mono">{recipientCount} Recipient(s)</span>
                  </div>
                  <div className="text-slate-600">
                    <span className="font-semibold text-slate-500 block">Subject Line:</span>
                    <span className="font-mono text-slate-800 truncate block">{campaign.subject}</span>
                  </div>
                </div>

                <div className="text-slate-500 text-[11px] leading-relaxed">
                  Clicking launch will personalize and send individual emails via Gmail API. Recipient contact statuses will update to <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">sent</code> and EmailEvent logs will be created.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLaunchCampaign}
                    disabled={!authStatus.connected || sendingCampaign || recipientCount === 0}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-xs transition-all"
                  >
                    {sendingCampaign ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Dispatching Emails...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Launch Campaign Now
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: Send Test Email */}
        {activeTab === 'test' && (
          <form onSubmit={handleSendTest} className="space-y-4 text-xs">
            {testSuccessMsg && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{testSuccessMsg}</span>
              </div>
            )}

            {testErrorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{testErrorMsg}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Recipient Email Address *</label>
              <input
                type="email"
                required
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1 text-slate-500">
              <span className="font-semibold text-slate-700 block">Preview Subject:</span>
              <span className="font-mono text-slate-800 text-[11px] block truncate">[TEST] {campaign.subject}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={!authStatus.connected || sendingTest}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold shadow-xs transition-all"
              >
                {sendingTest ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending Test...
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    Send Test Email
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
