import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Loader2,
  Users,
  Clock,
  Calendar,
  AlertCircle,
  Play,
  Pause,
  Eye,
  MousePointer,
  MessageSquareReply,
  BarChart3
} from 'lucide-react';
import { getCampaigns, deleteCampaign, pauseCampaign, resumeCampaign } from '../services/api';
import SendCampaignModal from '../components/SendCampaignModal';

const STATUS_BADGES = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  scheduled: 'bg-amber-50 text-amber-700 border-amber-200',
  running: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function CampaignsPage() {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Send Campaign Modal State
  const [selectedCampaignForSend, setSelectedCampaignForSend] = useState(null);

  useEffect(() => {
    fetchCampaignsList();
  }, [searchQuery, statusFilter]);

  const fetchCampaignsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCampaigns({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
      });
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseCampaign = async (id) => {
    try {
      await pauseCampaign(id);
      fetchCampaignsList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to pause campaign');
    }
  };

  const handleResumeCampaign = async (id) => {
    try {
      await resumeCampaign(id);
      fetchCampaignsList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resume campaign');
    }
  };

  const handleDeleteCampaign = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete campaign "${name}"?`)) {
      return;
    }

    try {
      await deleteCampaign(id);
      setCampaigns(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete campaign');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Outreach Campaigns</h2>
          <p className="text-sm text-slate-500 mt-1">
            Create, manage, launch, pause, and track automated email engagement metrics.
          </p>
        </div>
        <button
          onClick={() => navigate('/campaigns/new')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Campaign
        </button>
      </div>

      {/* Toolbar - Search & Filter */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns by name, subject, description..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="running">Running</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs font-medium">Loading campaigns from database...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-rose-600 text-xs font-medium flex flex-col items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Send className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No campaigns created yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery || statusFilter
              ? 'No campaigns match your search criteria.'
              : 'Create your first email campaign with variable tags and follow-up schedules.'}
          </p>
          <button
            onClick={() => navigate('/campaigns/new')}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Create Campaign Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => {
            const recipientCount = Array.isArray(campaign.contacts) ? campaign.contacts.length : 0;
            const followUpCount = Array.isArray(campaign.followUps) ? campaign.followUps.length : 0;

            return (
              <div
                key={campaign._id}
                className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {campaign.name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${STATUS_BADGES[campaign.status] || 'bg-slate-100'}`}>
                      {campaign.status}
                    </span>
                  </div>

                  {campaign.subject && (
                    <p className="text-xs text-slate-500 font-mono line-clamp-1">
                      Subject: {campaign.subject}
                    </p>
                  )}
                </div>

                {/* Campaign Metrics Bar */}
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> Recipients:
                    </span>
                    <span className="font-semibold text-slate-900">{recipientCount} contacts</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Follow-ups:
                    </span>
                    <span className="font-semibold text-slate-900">{followUpCount} steps</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Created:
                    </span>
                    <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {campaign.status === 'running' ? (
                      <button
                        onClick={() => handlePauseCampaign(campaign._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        Pause
                      </button>
                    ) : campaign.status === 'paused' ? (
                      <button
                        onClick={() => handleResumeCampaign(campaign._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Resume
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedCampaignForSend(campaign)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Send / Test
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/campaigns/${campaign._id}`)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                      title="Edit Campaign"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteCampaign(campaign._id, campaign.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Send Campaign Modal */}
      <SendCampaignModal
        campaign={selectedCampaignForSend}
        isOpen={Boolean(selectedCampaignForSend)}
        onClose={() => setSelectedCampaignForSend(null)}
        onCampaignUpdated={fetchCampaignsList}
      />
    </div>
  );
}
