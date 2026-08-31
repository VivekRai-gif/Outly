import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  FileText, 
  Send, 
  Clock, 
  Users, 
  Mail, 
  Flame, 
  BarChart3, 
  Play, 
  ChevronRight,
  Bot,
  Lock,
  Eye,
  MousePointerClick,
  Workflow,
  Layers,
  KeyRound,
  Database,
  TrendingUp,
  CheckCircle2,
  Activity,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('demo');
  const [extractedSample, setExtractedSample] = useState(false);

  const handleLaunchDashboard = () => {
    if (!isAuthenticated) {
      quickDemoLogin();
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#020202] text-[#F5F5F5] font-sans selection:bg-white selection:text-black relative overflow-hidden">
      {/* 11. Huge Gray Charcoal Abstract Shape & White Glow */}
      <div className="hero-charcoal-shape top-[-100px] left-1/2 -translate-x-1/2" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] center-white-glow pointer-events-none" />

      {/* Top Floating Glass Header */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="glass rounded-full px-5 py-3 flex items-center justify-between shadow-2xl">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Outly Logo" className="w-8 h-8 object-contain rounded-lg transition-transform group-hover:scale-105" />
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-lg tracking-tight text-[#FBFBFC]">Outly</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A0A0A0] bg-white/5 px-1.5 py-0.5 rounded border border-white/10">AI</span>
            </div>
          </Link>

          {/* Navigation Links Pill Box */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0E0E0E] border border-white/10 rounded-full px-3 py-1.5 text-xs font-medium text-[#A0A0A0]">
            <a href="#features" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition-colors">Features</a>
            <a href="#workflow" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition-colors">How It Works</a>
            <a href="#security" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition-colors">Security</a>
            <a href="#analytics" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition-colors">Analytics</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="primary-btn px-4 py-2 rounded-full text-xs flex items-center gap-1.5"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="secondary-btn px-4 py-2 rounded-full text-xs"
                >
                  Sign In
                </Link>
                <button
                  onClick={handleLaunchDashboard}
                  className="primary-btn px-4 py-2 rounded-full text-xs flex items-center gap-1.5"
                >
                  <span>Launch App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center z-10">
        {/* Sub-badge pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 backdrop-blur-md mb-8 text-xs font-medium text-[#A0A0A0]">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span>Next-Gen PDF Outreach & Automated Follow-Up Platform</span>
        </div>

        {/* Hero Title - Monochromatic Contrast Styling */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#FBFBFC] leading-[1.1] mb-6">
          Turn PDF Leads into <br className="hidden sm:block" />
          <span className="text-[#F5F5F5]">Personalized Emails with </span>
          <span className="font-serif italic font-normal text-[#A0A0A0]">
            Smart Follow-ups
          </span>
        </h1>

        {/* Sub-headline (Secondary Text - 60% opacity / #A0A0A0) */}
        <p className="text-base sm:text-lg text-[#A0A0A0] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Upload contact lists or resumes in PDF format. Automatically extract clean contacts, schedule multi-step email campaigns, and auto-cancel follow-ups the second a lead replies.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={handleLaunchDashboard}
            className="primary-btn w-full sm:w-auto px-8 py-3.5 rounded-full text-sm flex items-center justify-center gap-2 group"
          >
            <BarChart3 className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
            <span>Open Live Dashboard</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href="#demo-section"
            className="secondary-btn w-full sm:w-auto px-7 py-3.5 rounded-full text-sm flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-[#A0A0A0]" />
            <span>Interactive PDF Demo</span>
          </a>
        </div>

        {/* Stat Bar Divider Line */}
        <div className="w-full h-px bg-white/10 mb-8" />

        {/* Stats Callout Bar (Monochromatic Dark Grayscale) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 px-6 rounded-2xl bg-[#0E0E0E] border border-white/10 backdrop-blur-md text-xs text-[#A0A0A0]">
          <div className="flex items-center justify-center gap-2 font-medium">
            <Zap className="w-4 h-4 text-white shrink-0" />
            <span><strong className="text-[#FBFBFC] font-semibold">10,000+</strong> TPS Processing</span>
          </div>
          <div className="flex items-center justify-center gap-2 font-medium">
            <Flame className="w-4 h-4 text-white shrink-0" />
            <span><strong className="text-[#FBFBFC] font-semibold">99.4%</strong> Reply Stop Accuracy</span>
          </div>
          <div className="flex items-center justify-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-white shrink-0" />
            <span><strong className="text-[#FBFBFC] font-semibold">100%</strong> Gmail OAuth 2.0</span>
          </div>
          <div className="flex items-center justify-center gap-2 font-medium">
            <Clock className="w-4 h-4 text-white shrink-0" />
            <span><strong className="text-[#FBFBFC] font-semibold">&lt; 2s</strong> PDF Parse Speed</span>
          </div>
        </div>
      </section>

      {/* Live Interactive PDF Sandbox Teaser */}
      <section id="demo-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10">
        <div className="bg-[#0E0E0E] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#777777] block mb-1">Live Engine Preview</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#FBFBFC] tracking-tight">PDF Contact Extraction & Follow-up Funnel</h2>
            </div>
            <div className="flex items-center gap-2 bg-[#1A1B1A] border border-white/10 rounded-xl p-1 text-xs">
              <button 
                onClick={() => setActiveTab('demo')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'demo' ? 'bg-[#262626] text-white shadow-sm' : 'text-[#777777] hover:text-white'}`}
              >
                Extraction Sandbox
              </button>
              <button 
                onClick={() => setActiveTab('workflow')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'workflow' ? 'bg-[#262626] text-white shadow-sm' : 'text-[#777777] hover:text-white'}`}
              >
                Follow-up Logic
              </button>
            </div>
          </div>

          {activeTab === 'demo' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Sandbox Drop Area */}
              <div className="bg-[#1A1B1A] border border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-white/40 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-white mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Simulate PDF Upload</h3>
                <p className="text-xs text-[#A0A0A0] mb-6 max-w-xs mx-auto">
                  Click below to test parsing contact data (Name, Email, Role, Company) from an example PDF file.
                </p>
                <button
                  onClick={() => setExtractedSample(true)}
                  className="primary-btn px-6 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 mx-auto"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Parse Sample PDF</span>
                </button>
              </div>

              {/* Right Output Contacts Table */}
              <div className="bg-[#1A1B1A] border border-white/10 rounded-2xl p-6 min-h-[260px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-[#F5F5F5] flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#A0A0A0]" />
                      Extracted Contacts Preview
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-[#F5F5F5] border border-white/15">
                      {extractedSample ? '3 Leads Identified' : 'Ready for input'}
                    </span>
                  </div>

                  {extractedSample ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-[#262626] border border-white/10 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-white">Rahul Sharma</p>
                          <p className="text-[#A0A0A0] text-[11px]">rahul@abctech.com • SDE Intern</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-medium">ABC Tech</span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#262626] border border-white/10 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-white">Priya Singh</p>
                          <p className="text-[#A0A0A0] text-[11px]">priya@xyzlabs.io • Growth Lead</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-medium">XYZ Labs</span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#262626] border border-white/10 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-white">Alex Rivera</p>
                          <p className="text-[#A0A0A0] text-[11px]">alex@monad.dev • Operations Mgr</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-medium">Monad Labs</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-[#777777] text-xs flex flex-col items-center justify-center">
                      <Bot className="w-8 h-8 text-[#555555] mb-2 animate-bounce" />
                      <span>Click "Parse Sample PDF" on the left to test live extraction</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#A0A0A0]">
                  <span>Variables: <code className="text-white">{`{{name}}`}</code>, <code className="text-white">{`{{company}}`}</code>, <code className="text-white">{`{{role}}`}</code></span>
                  <button 
                    onClick={handleLaunchDashboard} 
                    className="text-white hover:underline font-medium flex items-center gap-1"
                  >
                    <span>Import to Campaign</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-[#1A1B1A] border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-white/10 text-white mx-auto flex items-center justify-center mb-2 font-bold text-xs">Day 0</div>
                  <h4 className="text-sm font-semibold text-white mb-1">Initial Email</h4>
                  <p className="text-[11px] text-[#A0A0A0]">Personalized outreach sent automatically via Gmail API.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#1A1B1A] border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-white/10 text-white mx-auto flex items-center justify-center mb-2 font-bold text-xs">Day 3</div>
                  <h4 className="text-sm font-semibold text-white mb-1">Follow-up #1</h4>
                  <p className="text-[11px] text-[#A0A0A0]">Gentle check-in if no reply detected.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#1A1B1A] border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-white/10 text-white mx-auto flex items-center justify-center mb-2 font-bold text-xs">Reply?</div>
                  <h4 className="text-sm font-semibold text-white mb-1">Auto Reply Detector</h4>
                  <p className="text-[11px] text-[#A0A0A0]">Scans inbox for incoming lead response.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#262626] border border-white/20">
                  <div className="w-8 h-8 rounded-full bg-white text-black mx-auto flex items-center justify-center mb-2 font-bold text-xs">STOP</div>
                  <h4 className="text-sm font-semibold text-white mb-1">Sequence Cancelled</h4>
                  <p className="text-[11px] text-[#A0A0A0]">Pending follow-ups immediately stopped!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 1. FEATURES SECTION (#features) */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#A0A0A0] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Engine Features</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#FBFBFC] tracking-tight">Everything You Need for High-Converting Outreach</h2>
          <p className="text-sm sm:text-base text-[#A0A0A0] mt-3 max-w-xl mx-auto">
            Outly automates the manual, repetitive grind of cold email outreach from list extraction to reply detection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#1A1B1A] border border-white/10 rounded-2xl p-6 hover:bg-[#262626] hover:border-white/20 transition-all hover:translate-y-[-2px] group">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#FBFBFC] mb-2">Smart PDF Contact Parsing</h3>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">
              Upload multi-page PDFs, lead rosters, or applicant bundles. Outly extracts clean structured lead profiles (Name, Email, Role, Company) in under 2 seconds.
            </p>
          </div>

          <div className="bg-[#1A1B1A] border border-white/10 rounded-2xl p-6 hover:bg-[#262626] hover:border-white/20 transition-all hover:translate-y-[-2px] group">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#FBFBFC] mb-2">Personalized Variable Templates</h3>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">
              Define reusable email templates with custom tag variables like <code className="text-white bg-white/10 px-1 py-0.5 rounded">{`{{name}}`}</code> and <code className="text-white bg-white/10 px-1 py-0.5 rounded">{`{{company}}`}</code> for hyper-personalized messaging.
            </p>
          </div>

          <div className="bg-[#1A1B1A] border border-white/10 rounded-2xl p-6 hover:bg-[#262626] hover:border-white/20 transition-all hover:translate-y-[-2px] group">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#FBFBFC] mb-2">Automated Reply Cancellation</h3>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">
              Never annoy leads who have already replied. Outly constantly monitors responses and auto-cancels scheduled follow-up steps immediately.
            </p>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION (#workflow) */}
      <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-white/10 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#A0A0A0] mb-4">
            <Workflow className="w-3.5 h-3.5 text-white" />
            <span>Workflow & Engine Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#FBFBFC] tracking-tight">How Outly Works in 4 Simple Steps</h2>
          <p className="text-sm sm:text-base text-[#A0A0A0] mt-3 max-w-xl mx-auto">
            From raw PDF documents to booked meetings, here is how Outly automates your end-to-end outreach pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl p-6 relative group hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center mb-4">01</div>
            <h3 className="text-base font-bold text-[#FBFBFC] mb-2">Upload Lead PDFs</h3>
            <p className="text-xs text-[#A0A0A0] leading-relaxed">
              Drag and drop PDF lead sheets, conference attendee lists, or resumes into Outly's AI parser.
            </p>
          </div>

          <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl p-6 relative group hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center mb-4">02</div>
            <h3 className="text-base font-bold text-[#FBFBFC] mb-2">Draft Campaign Sequence</h3>
            <p className="text-xs text-[#A0A0A0] leading-relaxed">
              Create multi-step follow-up schedules (Day 0, Day 3, Day 7) enriched with dynamic template variables.
            </p>
          </div>

          <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl p-6 relative group hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center mb-4">03</div>
            <h3 className="text-base font-bold text-[#FBFBFC] mb-2">Connect Gmail & Send</h3>
            <p className="text-xs text-[#A0A0A0] leading-relaxed">
              Authorize via official Gmail OAuth 2.0. Emails dispatch natively from your inbox with high deliverability.
            </p>
          </div>

          <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl p-6 relative group hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center mb-4">04</div>
            <h3 className="text-base font-bold text-[#FBFBFC] mb-2">Auto-Stop on Reply</h3>
            <p className="text-xs text-[#A0A0A0] leading-relaxed">
              Outly monitors incoming replies in real-time and auto-cancels scheduled follow-ups the moment a lead responds.
            </p>
          </div>
        </div>
      </section>

      {/* 3. SECURITY SECTION (#security) */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-white/10 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#A0A0A0] mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Enterprise Security</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#FBFBFC] tracking-tight">Built for Uncompromised Privacy & Safety</h2>
          <p className="text-sm sm:text-base text-[#A0A0A0] mt-3 max-w-xl mx-auto">
            Your credentials and lead data are protected by industry-standard encryption protocols and official Google Cloud OAuth safeguards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#1A1B1A] border border-white/10 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#FBFBFC] mb-1">Official Gmail OAuth 2.0 Connection</h3>
              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                Outly <strong className="text-white">never</strong> asks for or stores raw email passwords. Authentication is handled directly via Google Cloud OAuth token handshake.
              </p>
            </div>
          </div>

          <div className="bg-[#1A1B1A] border border-white/10 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#FBFBFC] mb-1">Encrypted OAuth Token Vault</h3>
              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                Tokens are stored using AES-256 server-side encryption. Refresh tokens are scoped strictly to sending outreach and checking inbox replies.
              </p>
            </div>
          </div>

          <div className="bg-[#1A1B1A] border border-white/10 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#FBFBFC] mb-1">Private Lead Data Isolation</h3>
              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                All extracted contacts, campaign templates, and analytics are isolated per account with strict database access controls.
              </p>
            </div>
          </div>

          <div className="bg-[#1A1B1A] border border-white/10 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#FBFBFC] mb-1">Google Rate Limit & Anti-Spam Compliance</h3>
              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                Automated campaign scheduling enforces sending delays between messages to maintain high domain reputation and prevent spam flagging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ANALYTICS SECTION (#analytics) */}
      <section id="analytics" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-white/10 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#A0A0A0] mb-4">
            <BarChart3 className="w-3.5 h-3.5 text-white" />
            <span>Campaign Analytics & Insights</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#FBFBFC] tracking-tight">Real-Time Tracking & Response Metrics</h2>
          <p className="text-sm sm:text-base text-[#A0A0A0] mt-3 max-w-xl mx-auto">
            Track opens, clicks, delivery states, and reply rates live with transparent campaign metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#1A1B1A] border border-white/10 rounded-2xl p-6 hover:bg-[#262626] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#FBFBFC] mb-2">Live Open Tracking</h3>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">
              Embedded 1x1 transparent tracking pixels log the exact timestamp and device whenever a lead views your email.
            </p>
          </div>

          <div className="bg-[#1A1B1A] border border-white/10 rounded-2xl p-6 hover:bg-[#262626] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <MousePointerClick className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#FBFBFC] mb-2">Click-Through Analytics</h3>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">
              Track link clicks inside your emails to identify high-intent leads interested in your offering or portfolio.
            </p>
          </div>

          <div className="bg-[#1A1B1A] border border-white/10 rounded-2xl p-6 hover:bg-[#262626] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#FBFBFC] mb-2">Conversion Funnel Stats</h3>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">
              Visualize your entire outreach pipeline with real-time graphs for total sent, open rate %, click rate %, and reply conversion %.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 text-xs text-[#777777] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Outly Logo" className="w-6 h-6 object-contain rounded-md" />
          <span className="font-semibold text-[#F5F5F5]">Outly Engine &copy; 2026</span>
          <span className="text-[#555555]">•</span>
          <span>Reach out. Follow up. Never lose a lead.</span>
        </div>

        <div className="flex items-center gap-6 text-[#A0A0A0]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#workflow" className="hover:text-white transition-colors">How It Works</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
          <a href="#analytics" className="hover:text-white transition-colors">Analytics</a>
          <Link to="/signin" className="hover:text-white transition-colors">Sign In</Link>
          <button onClick={handleLaunchDashboard} className="hover:text-white transition-colors">Dashboard</button>
        </div>
      </footer>
    </div>
  );
}
