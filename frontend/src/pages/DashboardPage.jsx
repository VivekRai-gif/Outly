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
  ChevronRight,
  Activity,
  Layers,
  Inbox
} from 'lucide-react';
import { getDashboardStats } from '../services/api';

const EVENT_ICON_MAP = {
  sent: { label: 'Email sent', icon: Send, color: 'text-white bg-[#262626] border-white/10' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-white bg-[#262626] border-white/10' },
  opened: { label: 'Open detected', icon: Eye, color: 'text-white bg-[#262626] border-white/10' },
  clicked: { label: 'Link clicked', icon: MousePointer, color: 'text-white bg-[#262626] border-white/10' },
  replied: { label: 'Reply received', icon: MessageSquareReply, color: 'text-white bg-[#262626] border-white/10' },
  failed: { label: 'Sending failed', icon: XCircle, color: 'text-white bg-[#262626] border-white/10' },
  bounced: { label: 'Email bounced', icon: AlertCircle, color: 'text-white bg-[#262626] border-white/10' },
};

const CAMPAIGN_STATUS_BADGES = {
  draft: 'bg-[#1A1B1A] text-[#A1A1AA] border-white/10',
  scheduled: 'bg-white/10 text-white border-white/20',
  running: 'bg-white text-black border-white font-bold',
  paused: 'bg-[#262626] text-[#A1A1AA] border-white/10',
  completed: 'bg-white/10 text-white border-white/20',
  failed: 'bg-white/10 text-white border-white/20',
};

const WORKFLOW_STEPS = [
  { step: '01', title: 'Upload PDF', desc: 'Drag & drop document files containing contact lists', icon: FileUp, link: '/dashboard/upload' },
  { step: '02', title: 'Extract Contacts', desc: 'Auto-extract names, emails, roles & companies', icon: Zap, link: '/dashboard/contacts' },
  { step: '03', title: 'Create Campaign', desc: 'Select recipients & pick high-converting templates', icon: Plus, link: '/dashboard/campaigns/new' },
  { step: '04', title: 'Send Emails', desc: 'Dispatch personalized emails via your connected Gmail API', icon: Send, link: '/dashboard/campaigns' },
  { step: '05', title: 'Automated Follow-ups', desc: 'Multi-step sequences that pause automatically when replied', icon: Clock, link: '/dashboard/campaigns' },
  { step: '06', title: 'Track Engagement', desc: 'Real-time open pixels, link clicks & inbox reply detection', icon: BarChart3, link: '/dashboard' },
];

const CORE_FEATURES = [
  {
    title: 'PDF Contact Extraction',
    desc: 'Intelligent multi-format PDF parsing that automatically extracts names, emails, companies, and job titles with zero manual data entry.',
    icon: FileUp,
    badge: 'Automated',
    badgeColor: 'bg-white/10 text-white border-white/15',
  },
  {
    title: 'Personalized Email Campaigns',
    desc: 'Dynamic template engine with variable substitution ({{name}}, {{role}}, {{company}}) and pre-loaded templates for Internship, Job App, & Referral.',
    icon: Send,
    badge: 'Templates Included',
    badgeColor: 'bg-white/10 text-white border-white/15',
  },
  {
    title: 'Automated Follow-up Engine',
    desc: 'Schedule multi-step follow-up delays that automatically stop the sequence the moment a recipient replies to your outreach.',
    icon: Clock,
    badge: 'Smart Cancelling',
    badgeColor: 'bg-white/10 text-white border-white/15',
  },
  {
    title: 'Gmail Reply Detection',
    desc: 'Automated Gmail inbox monitoring matching incoming thread replies to contact records and updating status to Replied.',
    icon: MailCheck,
    badge: 'Inbox Monitoring',
    badgeColor: 'bg-white/10 text-white border-white/15',
  },
  {
    title: 'Email Open & Click Tracking',
    desc: 'Embedded 1x1 tracking pixels and link redirects with 5-second event deduplication to measure true recipient engagement.',
    icon: Eye,
    badge: 'Deduplicated',
    badgeColor: 'bg-white/10 text-white border-white/15',
  },
  {
    title: 'Campaign Analytics',
    desc: 'Real-time analytics dashboard with aggregated metrics, recipient timelines, activity streams, and status breakdown reports.',
    icon: BarChart3,
    badge: 'Live Data',
    badgeColor: 'bg-white/10 text-white border-white/15',
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E0E0E] via-[#1A1B1A] to-[#0E0E0E] p-8 sm:p-10 text-white shadow-2xl border border-white/10">
        <div className="hero-charcoal-shape -right-12 -top-12" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs font-semibold text-[#A1A1AA]">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Outly Automated Outreach & Email Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#FBFBFC] leading-tight">
              Welcome to Outly
            </h1>

            <p className="text-base sm:text-lg font-medium text-[#A1A1AA] leading-relaxed">
              Reach out. Follow up. Never lose a lead.
            </p>

            <p className="text-xs text-[#71717A] max-w-xl leading-relaxed">
              Extract contacts from PDF files, launch personalized Gmail outreach campaigns, and let automated follow-up sequences close your leads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto shrink-0 pt-2 lg:pt-0">
            <button
              onClick={() => navigate('/dashboard/campaigns/new')}
              className="primary-btn px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Campaign
            </button>

            <button
              onClick={() => navigate('/dashboard/upload')}
              className="secondary-btn px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <FileUp className="w-4 h-4" />
              Upload PDF
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-[#1A1B1A] border border-white/20 text-white text-xs flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchStats} className="px-3 py-1 secondary-btn rounded-lg font-bold">
            Retry
          </button>
        </div>
      )}

      {/* 2. QUICK STATS CARDS (4 Primary Cards - #1A1B1A Surface) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[
          {
            label: 'Total Contacts',
            value: metrics.totalContacts,
            icon: Users,
            desc: 'Verified outreach contacts'
          },
          {
            label: 'Emails Sent',
            value: metrics.emailsSent,
            icon: Send,
            desc: 'Dispatched via Gmail API'
          },
          {
            label: 'Follow-ups Pending',
            value: metrics.followUpsPending,
            icon: Clock,
            desc: 'Scheduled queue jobs'
          },
          {
            label: 'Replies Received',
            value: metrics.replies,
            icon: MessageSquareReply,
            desc: 'Active inbox responses'
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-[#1A1B1A] rounded-2xl p-5 border border-white/10 shadow-2xl hover:border-white/20 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">{card.label}</span>
                <div className="p-2.5 rounded-xl bg-[#262626] border border-white/10 text-white">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#FBFBFC] tracking-tight">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-[#71717A]" /> : card.value.toLocaleString()}
                </span>
                <p className="text-[11px] text-[#71717A] font-medium mt-0.5">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. HOW OUTLY WORKS SECTION (#0E0E0E Container + #1A1B1A Step Cards) */}
      <div className="bg-[#0E0E0E] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-[#FBFBFC] flex items-center gap-2">
              <Zap className="w-5 h-5 text-white" />
              How Outly Works
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              The automated email outreach lifecycle from PDF extraction to reply detection.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white border border-white/15 self-start sm:self-auto">
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
                className="group relative bg-[#1A1B1A] hover:bg-[#262626] rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-center font-bold text-xs group-hover:bg-white group-hover:text-black transition-colors">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#71717A] group-hover:text-white transition-colors">
                      STEP {step.step}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#FBFBFC] group-hover:text-white transition-colors">
                    {step.title}
                  </h4>

                  <p className="text-xs text-[#A1A1AA] leading-relaxed font-sans">
                    {step.desc}
                  </p>
                </div>

                <div className="flex items-center text-[11px] font-semibold text-white gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. CORE FEATURES SECTION (#1A1B1A Surface Cards) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#FBFBFC] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            Core Outly Capabilities
          </h3>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Everything built into Outly to scale your cold email outreach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CORE_FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-[#1A1B1A] rounded-2xl p-5 border border-white/10 shadow-2xl hover:bg-[#262626] hover:border-white/20 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-white/10 text-white border border-white/15">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#FBFBFC]">{feat.title}</h4>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed font-sans">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. RECENT CAMPAIGNS SECTION (#0E0E0E Container) */}
      <div className="bg-[#0E0E0E] rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-[#FBFBFC] flex items-center gap-2">
              <Send className="w-4 h-4 text-white" /> Recent Outreach Campaigns
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Monitor active campaign progress, recipient lists, and sending statuses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard/campaigns')}
              className="secondary-btn px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              View All Campaigns
            </button>
            <button
              onClick={() => navigate('/dashboard/campaigns/new')}
              className="primary-btn inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Create
            </button>
          </div>
        </div>

        {/* Toolbar - Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={campaignSearch}
              onChange={(e) => setCampaignSearch(e.target.value)}
              placeholder="Search campaigns by name or subject line..."
              className="w-full pl-9 pr-4 py-2 bg-[#1A1B1A] border border-white/10 rounded-xl text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[#71717A] shrink-0" />
            <select
              value={campaignStatusFilter}
              onChange={(e) => setCampaignStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-[#1A1B1A] border border-white/10 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-white/30"
            >
              <option value="" className="bg-[#1A1B1A] text-white">All Statuses</option>
              <option value="draft" className="bg-[#1A1B1A] text-white">Draft</option>
              <option value="running" className="bg-[#1A1B1A] text-white">Running</option>
              <option value="paused" className="bg-[#1A1B1A] text-white">Paused</option>
              <option value="completed" className="bg-[#1A1B1A] text-white">Completed</option>
            </select>
          </div>
        </div>

        {/* Campaigns Table / Empty State */}
        {loading ? (
          <div className="p-8 text-center text-[#71717A] flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
            <span className="text-xs">Loading campaign data...</span>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-white/15 rounded-2xl space-y-3 bg-[#1A1B1A]">
            <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto border border-white/15">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#FBFBFC]">No campaigns found</h4>
            <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
              {campaignSearch || campaignStatusFilter
                ? 'No campaigns match your search query.'
                : 'Create your first email outreach campaign to start sending automated emails.'}
            </p>
            <button
              onClick={() => navigate('/dashboard/campaigns/new')}
              className="primary-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs"
            >
              <Plus className="w-4 h-4" /> Create First Campaign
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#1A1B1A]">
            <table className="w-full text-left text-xs text-[#F5F5F5]">
              <thead className="bg-[#1A1B1A] text-[#A1A1AA] uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="p-3">Campaign Name</th>
                  <th className="p-3">Subject Line</th>
                  <th className="p-3 text-center">Recipients</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Sending Progress</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredCampaigns.slice(0, 5).map((c) => {
                  const total = c.contactsCount || c.contacts?.length || 0;
                  const sent = c.sentCount || 0;
                  const percent = total > 0 ? Math.round((sent / total) * 100) : 0;
                  const badgeClass = CAMPAIGN_STATUS_BADGES[c.status] || 'bg-white/10 text-white border-white/15';

                  return (
                    <tr key={c._id} className="hover:bg-[#262626] transition-colors">
                      <td className="p-3 font-bold text-[#FBFBFC]">{c.name}</td>
                      <td className="p-3 text-[#A1A1AA] max-w-xs truncate">{c.subject}</td>
                      <td className="p-3 text-center font-mono font-bold text-white">{total}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badgeClass}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-[#71717A] font-mono">
                            <span>{sent}/{total} sent</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full bg-[#262626] rounded-full h-1.5 overflow-hidden">
                            <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => navigate(`/dashboard/campaigns/${c._id}`)}
                          className="inline-flex items-center gap-1 text-white hover:underline font-semibold"
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

      {/* 6. RECENT ACTIVITY STREAM SECTION (#0E0E0E Container) */}
      <div className="bg-[#0E0E0E] rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#FBFBFC] flex items-center gap-2">
              <Activity className="w-4 h-4 text-white" /> Recent Email Activity Stream
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Live engagement log showing sent emails, open events, link clicks, and recipient replies.
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="p-1.5 text-[#71717A] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Refresh stream"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#71717A] flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
            <span className="text-xs">Loading activity feed...</span>
          </div>
        ) : (!data?.recentEvents && !data?.recentActivity) || ((data?.recentEvents || data?.recentActivity || []).length === 0) ? (
          <div className="p-10 text-center border border-dashed border-white/15 rounded-2xl space-y-2 bg-[#1A1B1A]">
            <Inbox className="w-8 h-8 text-[#71717A] mx-auto" />
            <h4 className="text-sm font-bold text-[#FBFBFC]">No activity recorded yet</h4>
            <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
              Once you launch an outreach campaign, dispatched emails and recipient opens will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {(data?.recentEvents || data?.recentActivity || []).slice(0, 8).map((evt) => {
              const evtType = evt.type || evt.eventType || 'sent';
              const config = EVENT_ICON_MAP[evtType] || { label: evtType, icon: Activity, color: 'text-white bg-[#262626] border-white/10' };
              const Icon = config.icon;
              const contactEmail = evt.contactEmail || evt.contactId?.email || 'Recipient';
              const timeStr = evt.timestamp ? new Date(evt.timestamp).toLocaleString() : 'Just now';

              return (
                <div
                  key={evt._id}
                  className="p-3 rounded-2xl bg-[#1A1B1A] border border-white/10 flex items-center justify-between gap-3 text-xs hover:bg-[#262626] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl border ${config.color} shrink-0`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[#FBFBFC] truncate">
                        {config.label} — <span className="text-white font-mono">{contactEmail}</span>
                      </div>
                      {evt.campaignName && (
                        <span className="text-[10px] text-[#71717A]">Campaign: {evt.campaignName}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#71717A] shrink-0">{timeStr}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
