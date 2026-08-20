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
  Sparkles
} from 'lucide-react';
import { getGoogleAuthStatus, getGoogleAuthUrl, disconnectGoogleAuth } from '../services/api';

export default function SettingsPage() {
  const [searchParams] = useSearchParams();

  // OAuth States ('loading' | 'disconnected' | 'connecting' | 'connected' | 'error')
  const [authStatus, setAuthStatus] = useState('loading');
  const [authData, setAuthData] = useState({ connected: false, email: null, connectedAt: null });
  const [errorMsg, setErrorMsg] = useState(null);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    // Check URL search params for redirect feedback
    const authResult = searchParams.get('auth');
    const msg = searchParams.get('message');

    if (authResult === 'error') {
      setErrorMsg(msg || 'Google OAuth authentication failed.');
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
        // Redirect browser to Google OAuth consent screen
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Settings & Email Integrations</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage email connections, OAuth 2.0 authorization, security rules, and system configuration.
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {/* Email Account Connection Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Gmail OAuth 2.0 Integration</h3>
              <p className="text-xs text-slate-400">Connect your Google workspace for email sending and reply tracking</p>
            </div>
          </div>

          <div>
            {authStatus === 'loading' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking Status...
              </span>
            )}

            {authStatus === 'connecting' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Redirecting to Google...
              </span>
            )}

            {authStatus === 'connected' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected & Authorized
              </span>
            )}

            {(authStatus === 'disconnected' || authStatus === 'error') && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                Not Connected
              </span>
            )}
          </div>
        </div>

        {/* Security Rule Notice */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs text-slate-600">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-blue-600" /> Server-Side OAuth Security Enforcement
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-500 leading-relaxed pl-1">
            <li>Outly <strong>never</strong> asks for or stores raw email passwords.</li>
            <li>Client secrets and refresh tokens are stored strictly server-side.</li>
            <li>Uses least-privilege Google OAuth 2.0 scopes (`gmail.send`, `gmail.readonly`).</li>
          </ul>
        </div>

        {/* Dynamic Connection Controls */}
        <div className="pt-2">
          {authStatus === 'connected' ? (
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {authData.picture ? (
                  <img src={authData.picture} alt="Profile" className="w-10 h-10 rounded-full border border-emerald-300" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    {authData.email ? authData.email.charAt(0).toUpperCase() : 'G'}
                  </div>
                )}
                <div>
                  <div className="font-bold text-slate-900 text-sm">{authData.name || 'Gmail Account'}</div>
                  <div className="text-xs font-mono text-emerald-700">{authData.email}</div>
                  {authData.connectedAt && (
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Connected on {new Date(authData.connectedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto"
              >
                {disconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                Disconnect Account
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
              <div className="text-xs text-slate-500">
                Authorizing your Gmail account allows Outly to send personalized campaigns and automatically detect recipient replies.
              </div>
              <button
                onClick={handleConnectGmail}
                disabled={authStatus === 'connecting'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all shrink-0"
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

      {/* System Infrastructure Info Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Automation Engine Status</h3>
            <p className="text-xs text-slate-400">BullMQ & Redis background worker infrastructure</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
            <span className="font-medium">Express API Server</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Online
            </span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
            <span className="font-medium">MongoDB Database</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected
            </span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
            <span className="font-medium">BullMQ Queue Scheduler</span>
            <span className="font-medium text-slate-400">Phase 7</span>
          </div>
        </div>
      </div>
    </div>
  );
}
