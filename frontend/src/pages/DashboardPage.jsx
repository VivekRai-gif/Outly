import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Send,
  Clock,
  MessageSquareReply,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Eye,
  MousePointer,
  Loader2,
  Sparkles,
  RefreshCw,
  FileUp,
  MailCheck,
  BarChart3,
  Zap,
  ArrowRight,
  ShieldCheck,
  Check,
  ChevronRight,
  Activity,
  Layers,
  Inbox
} from 'lucide-react';
import { getDashboardStats } from '../services/api';

const EVENT_ICON_MAP = {
  sent: { label: 'Email sent', icon: Send, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  opened: { label: 'Open detected', icon: Eye, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  clicked: { label: 'Link clicked', icon: MousePointer, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  replied: { label: 'Reply received', icon: MessageSquareReply, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  failed: { label: 'Sending failed', icon: XCircle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  bounced: { label: 'Email bounced', icon: AlertCircle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
};

const CAMPAIGN_STATUS_BADGES = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  scheduled: 'bg-amber-50 text-amber-700 border-amber-200',
  running: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
};

const WORKFLOW_STEPS = [
  { step: '01', title: 'Upload PDF', desc: 'Drag & drop document files containing contact lists', icon: FileUp, link: '/upload' },
  { step: '02', title: 'Extract Contacts', desc: 'Auto-extract names, emails, roles & companies', icon: Zap, link: '/contacts' },
  { step: '03', title: 'Create Campaign', desc: 'Select recipients & pick high-converting templates', icon: Plus, link: '/campaigns/new' },
  { step: '04', title: 'Send Emails', desc: 'Dispatch personalized emails via your connected Gmail API', icon: Send, link: '/campaigns' },
  { step: '05', title: 'Automated Follow-ups', desc: 'Multi-step sequences that pause automatically when replied', icon: Clock, link: '/campaigns' },
  { step: '06', title: 'Track Engagement', desc: 'Real-time open pixels, link clicks & inbox reply detection', icon: BarChart3, link: '/' },
];

const CORE_FEATURES = [
  {
    title: 'PDF Contact Extraction',
    desc: 'Intelligent multi-format PDF parsing that automatically extracts names, emails, companies, and job titles with zero manual data entry.',
    icon: FileUp,
    badge: 'Automated',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    title: 'Personalized Email Campaigns',
    desc: 'Dynamic template engine with variable substitution ({{name}}, {{role}}, {{company}}) and pre-loaded templates for Internship, Job App, & Referral.',
    icon: Send,
    badge: 'Templates Included',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    title: 'Automated Follow-up Engine',
    desc: 'Schedule multi-step follow-up delays that automatically stop the sequence the moment a recipient replies to your outreach.',
    icon: Clock,
    badge: 'Smart Cancelling',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    title: 'Gmail Reply Detection',
    desc: 'Automated Gmail inbox monitoring matching incoming thread replies to contact records and updating status to Replied.',
    icon: MailCheck,
    badge: 'Inbox Monitoring',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    title: 'Email Open & Click Tracking',
    desc: 'Embedded 1x1 tracking pixels and link redirects with 5-second event deduplication to measure true recipient engagement.',
    icon: Eye,
    badge: 'Deduplicated',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    title: 'Campaign Analytics',
    desc: 'Real-time analytics dashboard with aggregated metrics, recipient timelines, activity streams, and status breakdown reports.',
    icon: BarChart3,
    badge: 'Live Data',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Filters for Campaigns section
  const [campaignSearch, setCampaignSearch] = useState('');
  const [campaignStatusFilter, setCampaignStatusFilter] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await getDashboardStats();
      setData(stats);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const metrics = data?.metrics || {
    totalContacts: 0,
    emailsSent: 0,
    followUpsPending: 0,
    replies: 0,
    bounces: 0,
    failedEmails: 0,
  };

  const filteredCampaigns = (data?.campaigns || []).filter((c) => {
    const query = campaignSearch.toLowerCase();
    const matchesSearch = (c.name || '').toLowerCase().includes(query) || (c.subject || '').toLowerCase().includes(query);
    const matchesStatus = !campaignStatusFilter || c.status === campaignStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. HERO HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 sm:p-10 text-white shadow-xl border border-blue-900/40">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Outly Automated Outreach & Email Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Welcome to Outly
            </h1>

            <p className="text-base sm:text-lg font-medium text-blue-100/90 leading-relaxed">
              Reach out. Follow up. Never lose a lead.
            </p>

            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Extract contacts from PDF files, launch personalized Gmail outreach campaigns, and let automated follow-up sequences close your leads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto shrink-0 pt-2 lg:pt-0">
            <button
              onClick={() => navigate('/campaigns/new')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Create New Campaign
            </button>

            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileUp className="w-4 h-4" />
              Upload PDF
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchStats} className="px-3 py-1 bg-white border border-rose-200 rounded-lg font-bold hover:bg-rose-100 text-rose-700">
            Retry
          </button>
        </div>
      )}

      {/* 2. QUICK STATS CARDS (4 Primary Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[
          {
            label: 'Total Contacts',
            value: metrics.totalContacts,
            icon: Users,
            color: 'text-blue-600 bg-blue-50 border-blue-200/80',
            desc: 'Verified outreach contacts'
          },
          {
            label: 'Emails Sent',
            value: metrics.emailsSent,
            icon: Send,
            color: 'text-emerald-600 bg-emerald-50 border-emerald-200/80',
            desc: 'Dispatched via Gmail API'
          },
          {
            label: 'Follow-ups Pending',
            value: metrics.followUpsPending,
            icon: Clock,
            color: 'text-indigo-600 bg-indigo-50 border-indigo-200/80',
            desc: 'Scheduled queue jobs'
          },
          {
            label: 'Replies Received',
            value: metrics.replies,
            icon: MessageSquareReply,
            color: 'text-purple-600 bg-purple-50 border-purple-200/80',
            desc: 'Active inbox responses'
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</span>
                <div className={`p-2.5 rounded-xl border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : card.value.toLocaleString()}
                </span>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. HOW OUTLY WORKS SECTION (6-step visual workflow) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              How Outly Works
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              The automated email outreach lifecycle from PDF extraction to reply detection.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 self-start sm:self-auto">
            6 Automated Steps
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORKFLOW_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(step.link)}
                className="group relative bg-slate-50/70 hover:bg-white rounded-2xl p-5 border border-slate-200/60 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-300 group-hover:text-blue-600 transition-colors">
                      STEP {step.step}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h4>

                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    {step.desc}
                  </p>
                </div>

                <div className="flex items-center text-[11px] font-semibold text-blue-600 gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. CORE FEATURES SECTION (6 Cards) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Core Outly Capabilities
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Everything built into Outly to scale your cold email outreach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CORE_FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{feat.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. RECENT CAMPAIGNS SECTION */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" /> Recent Outreach Campaigns
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor active campaign progress, recipient lists, and sending statuses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/campaigns')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              View All Campaigns
            </button>
            <button
              onClick={() => navigate('/campaigns/new')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Create
            </button>
          </div>
        </div>

        {/* Toolbar - Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={campaignSearch}
              onChange={(e) => setCampaignSearch(e.target.value)}
              placeholder="Search campaigns by name or subject line..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={campaignStatusFilter}
              onChange={(e) => setCampaignStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Campaigns Table / Empty State */}
        {loading ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs">Loading campaign data...</span>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No campaigns found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {campaignSearch || campaignStatusFilter
                ? 'No campaigns match your search query.'
                : 'Create your first email outreach campaign to start sending automated emails.'}
            </p>
            <button
              onClick={() => navigate('/campaigns/new')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" /> Create First Campaign
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3">Campaign Name</th>
                  <th className="p-3">Subject Line</th>
                  <th className="p-3 text-center">Recipients</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Sending Progress</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCampaigns.slice(0, 5).map((c) => {
                  const total = c.contactsCount || c.contacts?.length || 0;
                  const sent = c.sentCount || 0;
                  const percent = total > 0 ? Math.round((sent / total) * 100) : 0;
                  const badgeClass = CAMPAIGN_STATUS_BADGES[c.status] || 'bg-slate-100 text-slate-700';

                  return (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{c.subject}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-900">{total}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badgeClass}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>{sent}/{total} sent</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => navigate(`/campaigns/${c._id}`)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. RECENT ACTIVITY STREAM SECTION */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" /> Recent Email Activity Stream
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live engagement log showing sent emails, open events, link clicks, and recipient replies.
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            title="Refresh stream"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs">Loading activity feed...</span>
          </div>
        ) : (!data?.recentEvents && !data?.recentActivity) || ((data?.recentEvents || data?.recentActivity || []).length === 0) ? (
          <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-2xl space-y-2">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No activity recorded yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Once you launch an outreach campaign, dispatched emails and recipient opens will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {(data?.recentEvents || data?.recentActivity || []).slice(0, 8).map((evt) => {
              const evtType = evt.type || evt.eventType || 'sent';
              const config = EVENT_ICON_MAP[evtType] || { label: evtType, icon: Activity, color: 'text-slate-600 bg-slate-50 border-slate-200' };
              const Icon = config.icon;
              const contactEmail = evt.contactEmail || evt.contactId?.email || 'Recipient';
              const timeStr = evt.timestamp ? new Date(evt.timestamp).toLocaleString() : 'Just now';

              return (
                <div
                  key={evt._id}
                  className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl border ${config.color} shrink-0`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {config.label} — <span className="text-blue-600">{contactEmail}</span>
                      </div>
                      {evt.campaignName && (
                        <span className="text-[10px] text-slate-400">Campaign: {evt.campaignName}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{timeStr}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
