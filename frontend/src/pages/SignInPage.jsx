import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Building2, 
  ArrowRight, 
  AlertCircle, 
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignInPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        res = await register(name, email, password, company);
      } else {
        res = await login(email, password);
      }

      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMessage(res.message || 'Authentication failed');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    quickDemoLogin();
    navigate(from, { replace: true });
  };

  const handleGoogleSignIn = () => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    window.location.href = `${apiUrl}/auth/google?redirect=true`;
  };

  return (
    <div className="min-h-screen bg-[#020202] text-[#F5F5F5] font-sans flex flex-col justify-between relative overflow-hidden selection:bg-white selection:text-black">
      {/* Background Lighting */}
      <div className="hero-charcoal-shape top-[-100px] left-1/2 -translate-x-1/2" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] center-white-glow pointer-events-none" />

      {/* Top Header Link */}
      <header className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-xl tracking-tight text-[#FBFBFC] font-sans">Outly</span>
        </Link>

        <Link
          to="/"
          className="text-xs font-semibold text-[#A0A0A0] hover:text-white transition-colors"
        >
          &larr; Back to Main Page
        </Link>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-[#0E0E0E] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 text-white mx-auto flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-[#FBFBFC] tracking-tight">
              {isRegister ? 'Create Outly Account' : 'Sign in to Outly'}
            </h1>
            <p className="text-xs text-[#A0A0A0] mt-1">
              {isRegister ? 'Access PDF contact extraction & follow-up automation' : 'Enter your account details to access your dashboard'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="primary-btn w-full py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2.5"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              onClick={handleDemoAccess}
              type="button"
              className="secondary-btn w-full py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current text-white" />
              <span>One-Click Quick Demo Access</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="w-full border-t border-white/10" />
            <span className="absolute bg-[#0E0E0E] px-3 text-[11px] font-medium text-[#777777] uppercase tracking-wider">Or continue with email</span>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-[#A0A0A0] mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vivek Rai"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A1B1A] border border-white/10 text-white text-xs placeholder:text-[#555555] focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#A0A0A0] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A1B1A] border border-white/10 text-white text-xs placeholder:text-[#555555] focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A0A0A0] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A1B1A] border border-white/10 text-white text-xs placeholder:text-[#555555] focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-[#A0A0A0] mb-1">Company / Organization (Optional)</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Outly Labs"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A1B1A] border border-white/10 text-white text-xs placeholder:text-[#555555] focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="primary-btn w-full py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign In / Register */}
          <div className="mt-6 text-center text-xs text-[#A0A0A0]">
            {isRegister ? (
              <span>Already have an account?{' '}
                <button
                  onClick={() => { setIsRegister(false); setErrorMessage(''); }}
                  className="text-white font-semibold hover:underline"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>Don't have an account?{' '}
                <button
                  onClick={() => { setIsRegister(true); setErrorMessage(''); }}
                  className="text-white font-semibold hover:underline"
                >
                  Create One
                </button>
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-[11px] text-[#555555] z-10">
        Outly Engine &bull; Protected by Gmail OAuth 2.0 Security
      </footer>
    </div>
  );
}
