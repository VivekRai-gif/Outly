import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Mail, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
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
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#0E0E0E] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white/10 space-y-5 text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-white">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#FBFBFC]">Email Dispatch Control</h3>
              <p className="text-xs text-[#A1A1AA]">Launch outreach campaign or send test email</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#71717A] hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Connection Banner */}
        {checkingAuth ? (
          <div className="p-3 bg-[#1A1B1A] rounded-xl border border-white/10 text-xs text-[#A1A1AA] flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            Checking Gmail OAuth connection status...
          </div>
        ) : !authStatus.connected ? (
          <div className="p-4 rounded-2xl bg-[#1A1B1A] border border-white/20 text-xs text-white space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <ShieldAlert className="w-4 h-4 text-white" />
              Gmail Account Not Connected
            </div>
            <p className="text-[#A1A1AA] leading-relaxed">
              Outly requires an authorized Gmail OAuth connection to send emails. Please connect your account in Settings.
            </p>
            <button
              onClick={() => {
                onClose();
                navigate('/dashboard/settings');
              }}
              className="primary-btn inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold mt-1"
            >
              Go to Settings & Connect Gmail →
            </button>
          </div>
        ) : (
          <div className="p-3.5 bg-[#1A1B1A] border border-white/10 rounded-xl flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>Sender Account: <strong className="font-mono text-white">{authStatus.email}</strong></span>
            </div>
            <span className="text-[10px] uppercase font-bold text-black bg-white px-2 py-0.5 rounded">
              Ready
            </span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex bg-[#262626] p-1 rounded-xl text-xs font-semibold border border-white/10">
          <button
            onClick={() => setActiveTab('campaign')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'campaign' ? 'bg-white text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Launch Campaign ({recipientCount})
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'test' ? 'bg-white text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Send Test Email
          </button>
        </div>

        {/* TAB 1: Campaign Launch Confirmation */}
        {activeTab === 'campaign' && (
          <div className="space-y-4 text-xs">
            {campaignResult ? (
              <div className="p-4 rounded-2xl bg-[#1A1B1A] border border-white/20 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  Campaign Execution Finished!
                </div>
                <p className="text-[#A1A1AA] leading-relaxed">
                  {campaignResult.message}
                </p>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-white font-mono text-[11px]">
                  <span>Sent: <strong>{campaignResult.sentCount}</strong></span>
                  <span>Skipped: <strong>{campaignResult.skippedCount}</strong></span>
                  <span>Failed: <strong>{campaignResult.failedCount}</strong></span>
                </div>
              </div>
            ) : (
              <>
                {campaignErrorMsg && (
                  <div className="p-3 rounded-xl bg-[#1A1B1A] border border-white/20 text-white flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-white shrink-0" />
                    <span>{campaignErrorMsg}</span>
                  </div>
                )}

                <div className="bg-[#1A1B1A] p-4 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between font-bold text-[#FBFBFC]">
                    <span>Campaign: {campaign.name}</span>
                    <span className="text-white font-mono">{recipientCount} Recipient(s)</span>
                  </div>
                  <div className="text-[#A1A1AA]">
                    <span className="font-semibold text-[#71717A] block">Subject Line:</span>
                    <span className="font-mono text-white truncate block">{campaign.subject}</span>
                  </div>
                </div>

                <div className="text-[#71717A] text-[11px] leading-relaxed">
                  Clicking launch will personalize and send individual emails via Gmail API. Recipient contact statuses will update to <code className="bg-[#262626] px-1 py-0.5 rounded text-white">sent</code> and EmailEvent logs will be created.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={onClose}
                    className="secondary-btn px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLaunchCampaign}
                    disabled={!authStatus.connected || sendingCampaign || recipientCount === 0}
                    className="primary-btn inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    {sendingCampaign ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
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
              <div className="p-3.5 rounded-xl bg-[#1A1B1A] border border-white/20 text-white flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span>{testSuccessMsg}</span>
              </div>
            )}

            {testErrorMsg && (
              <div className="p-3.5 rounded-xl bg-[#1A1B1A] border border-white/20 text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-white shrink-0" />
                <span>{testErrorMsg}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-[#A1A1AA] mb-1">Recipient Email Address *</label>
              <input
                type="email"
                required
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 bg-[#1A1B1A] border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-white/30 placeholder:text-[#71717A]"
              />
            </div>

            <div className="bg-[#1A1B1A] p-3 rounded-xl border border-white/10 space-y-1 text-[#A1A1AA]">
              <span className="font-semibold text-[#71717A] block">Preview Subject:</span>
              <span className="font-mono text-white text-[11px] block truncate">[TEST] {campaign.subject}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="secondary-btn px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={!authStatus.connected || sendingTest}
                className="primary-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {sendingTest ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
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
