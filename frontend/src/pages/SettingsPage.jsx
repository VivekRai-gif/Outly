import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Mail, 
  ShieldCheck, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  LogOut, 
  ExternalLink,
  Lock,
  Sparkles,
  Send,
  Check
} from 'lucide-react';
import { getGoogleAuthStatus, getGoogleAuthUrl, disconnectGoogleAuth, sendTestEmail } from '../services/api';

export default function SettingsPage() {
  const [searchParams] = useSearchParams();

  // OAuth States ('loading' | 'disconnected' | 'connecting' | 'connected' | 'error')
  const [authStatus, setAuthStatus] = useState('loading');
  const [authData, setAuthData] = useState({ connected: false, email: null, connectedAt: null });
  const [errorMsg, setErrorMsg] = useState(null);
  const [disconnecting, setDisconnecting] = useState(false);

  // Test Email Console States
  const [testEmailTo, setTestEmailTo] = useState('');
  const [testSubject, setTestSubject] = useState('Test Outreach Email from Outly');
  const [testBody, setTestBody] = useState('<p>Hi {{name}},</p><p>This is a test email sent from Outly Outreach Engine.</p><p>Best regards,<br/>Vivek</p>');
  const [sendingTest, setSendingTest] = useState(false);
  const [testSuccessMsg, setTestSuccessMsg] = useState(null);

  useEffect(() => {
    // Check URL search params for redirect feedback
    const authResult = searchParams.get('auth');
    const msg = searchParams.get('message');

    if (authResult === 'error') {
      setErrorMsg(msg || 'Google OAuth authentication failed.');
    } else if (authResult === 'success' || authResult === 'google_success') {
      setErrorMsg(null);
    }

    fetchOAuthStatus();
  }, [searchParams]);

  const fetchOAuthStatus = async () => {
    setAuthStatus('loading');
    try {
      const data = await getGoogleAuthStatus();
      setAuthData(data);
      if (data.connected) {
        setAuthStatus('connected');
      } else {
        setAuthStatus('disconnected');
      }
    } catch (err) {
      console.error('Failed to fetch OAuth status:', err);
      setAuthStatus('disconnected');
    }
  };

  const handleConnectGmail = async () => {
    setAuthStatus('connecting');
    setErrorMsg(null);
    try {
      const data = await getGoogleAuthUrl();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg('Failed to generate Google OAuth authorization URL.');
        setAuthStatus('disconnected');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to initiate Google OAuth flow.');
      setAuthStatus('error');
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm(`Disconnect Gmail account "${authData.email}"?`)) {
      return;
    }

    setDisconnecting(true);
    setErrorMsg(null);
    try {
      await disconnectGoogleAuth();
      setAuthData({ connected: false, email: null, connectedAt: null });
      setAuthStatus('disconnected');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to disconnect account');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSendTestEmailSubmit = async (e) => {
    e.preventDefault();
    if (!testEmailTo) {
      alert('Please enter a recipient email address for testing.');
      return;
    }

    setSendingTest(true);
    setTestSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await sendTestEmail({
        to: testEmailTo,
        subject: testSubject,
        body: testBody,
      });

      setTestSuccessMsg(res.message || `Test email dispatched successfully to ${testEmailTo}!`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-xl font-bold text-[#FBFBFC]">Settings & Integrations</h2>
        <p className="text-xs text-[#A0A0A0] mt-1">
          Manage email connections, OAuth 2.0 authorization, security rules, and dispatch testing.
        </p>
      </div>

      {/* Global Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-white/10 border border-white/20 text-white text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {/* Gmail Connection Card */}
      <div className="bg-[#0E0E0E] rounded-2xl p-6 border border-white/10 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1B1A] border border-white/15 text-white flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#FBFBFC]">Gmail OAuth 2.0 Integration</h3>
              <p className="text-xs text-[#A0A0A0]">Connect your Google workspace for email sending and reply tracking</p>
            </div>
          </div>

          <div>
            {authStatus === 'loading' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#1A1B1A] text-[#A0A0A0] border border-white/10">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking Status...
              </span>
            )}

            {authStatus === 'connecting' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Redirecting to Google...
              </span>
            )}

            {authStatus === 'connected' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-black border border-white uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected & Authorized
              </span>
            )}

            {(authStatus === 'disconnected' || authStatus === 'error') && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#1A1B1A] text-[#777777] border border-white/10">
                Not Connected
              </span>
            )}
          </div>
        </div>

        {/* Security Rule Notice */}
        <div className="bg-[#1A1B1A] p-4 rounded-xl border border-white/10 space-y-2 text-xs text-[#A0A0A0]">
          <div className="font-bold text-white flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-white" /> Server-Side OAuth Security Enforcement
          </div>
          <ul className="list-disc list-inside space-y-1 text-[#A0A0A0] leading-relaxed pl-1">
            <li>Outly <strong>never</strong> asks for or stores raw email passwords.</li>
            <li>Client secrets and refresh tokens are stored strictly server-side.</li>
            <li>Uses least-privilege Google OAuth 2.0 scopes (`gmail.send`, `gmail.readonly`).</li>
          </ul>
        </div>

        {/* Dynamic Connection Controls */}
        <div className="pt-2">
          {authStatus === 'connected' ? (
            <div className="bg-[#1A1B1A] border border-white/15 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {authData.picture ? (
                  <img src={authData.picture} alt="Profile" className="w-10 h-10 rounded-full border border-white/30" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#262626] text-white flex items-center justify-center font-bold border border-white/20">
                    {authData.email ? authData.email.charAt(0).toUpperCase() : 'G'}
                  </div>
                )}
                <div>
                  <div className="font-bold text-white text-sm">{authData.name || 'Gmail Account'}</div>
                  <div className="text-xs font-mono text-[#A0A0A0]">{authData.email}</div>
                  {authData.connectedAt && (
                    <div className="text-[11px] text-[#777777] mt-0.5">
                      Connected on {new Date(authData.connectedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="secondary-btn inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold self-start sm:self-auto"
              >
                {disconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                Disconnect Account
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1A1B1A] p-4 rounded-xl border border-white/10">
              <div className="text-xs text-[#A0A0A0]">
                Authorizing your Gmail account allows Outly to send personalized campaigns and automatically detect recipient replies.
              </div>
              <button
                onClick={handleConnectGmail}
                disabled={authStatus === 'connecting'}
                className="primary-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs shrink-0"
              >
                {authStatus === 'connecting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting to Google...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Connect Gmail Account
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Send Test Email Console */}
      <div className="bg-[#0E0E0E] rounded-2xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <div className="w-9 h-9 rounded-xl bg-[#1A1B1A] border border-white/15 text-white flex items-center justify-center font-bold">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#FBFBFC]">Live Email Dispatch Testing Console</h3>
            <p className="text-xs text-[#A0A0A0]">Send an instant test email to verify sending pipeline & tracking elements</p>
          </div>
        </div>

        {testSuccessMsg && (
          <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-white shrink-0" />
            <span>{testSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleSendTestEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#A0A0A0] mb-1">Recipient Email Address</label>
            <input
              type="email"
              required
              value={testEmailTo}
              onChange={(e) => setTestEmailTo(e.target.value)}
              placeholder="e.g. your_email@domain.com"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1B1A] border border-white/10 text-white text-xs placeholder:text-[#555555] focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A0A0A0] mb-1">Subject Line</label>
            <input
              type="text"
              value={testSubject}
              onChange={(e) => setTestSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1B1A] border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A0A0A0] mb-1">Email Body (HTML Supported)</label>
            <textarea
              rows={3}
              value={testBody}
              onChange={(e) => setTestBody(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1B1A] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-white/30"
            />
          </div>

          <button
            type="submit"
            disabled={sendingTest}
            className="primary-btn px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            {sendingTest ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending Test Email...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Dispatch Test Email
              </>
            )}
          </button>
        </form>
      </div>

      {/* System Infrastructure Info Card */}
      <div className="bg-[#0E0E0E] rounded-2xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <div className="w-9 h-9 rounded-xl bg-[#1A1B1A] border border-white/15 text-white flex items-center justify-center font-bold">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#FBFBFC]">Automation Engine Infrastructure</h3>
            <p className="text-xs text-[#A0A0A0]">BullMQ & Redis background worker infrastructure</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-[#A0A0A0]">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A1B1A] border border-white/10">
            <span className="font-medium text-white">Express API Server</span>
            <span className="font-semibold text-white flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Online
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A1B1A] border border-white/10">
            <span className="font-medium text-white">MongoDB Database</span>
            <span className="font-semibold text-white flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
