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
  Pause
} from 'lucide-react';
import { getCampaigns, deleteCampaign, pauseCampaign, resumeCampaign } from '../services/api';
import SendCampaignModal from '../components/SendCampaignModal';

const STATUS_BADGES = {
  draft: 'bg-[#1A1B1A] text-[#A1A1AA] border-white/10',
  scheduled: 'bg-white/10 text-white border-white/20',
  running: 'bg-white text-black font-bold border-white',
  paused: 'bg-[#262626] text-[#A1A1AA] border-white/10',
  completed: 'bg-white/10 text-white border-white/20',
  failed: 'bg-white/10 text-white border-white/20',
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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#FBFBFC]">Outreach Campaigns</h2>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Create, manage, launch, pause, and track automated email engagement metrics.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/campaigns/new')}
          className="primary-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Campaign
        </button>
      </div>

      {/* Toolbar - Search & Filter */}
      <div className="bg-[#0E0E0E] rounded-2xl p-4 border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns by name, subject, description..."
            className="w-full pl-9 pr-4 py-2 bg-[#1A1B1A] border border-white/10 rounded-xl text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white/30"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#71717A] shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-[#1A1B1A] border border-white/10 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-white/30"
          >
            <option value="" className="bg-[#1A1B1A] text-white">All Statuses</option>
            <option value="draft" className="bg-[#1A1B1A] text-white">Draft</option>
            <option value="scheduled" className="bg-[#1A1B1A] text-white">Scheduled</option>
            <option value="running" className="bg-[#1A1B1A] text-white">Running</option>
            <option value="paused" className="bg-[#1A1B1A] text-white">Paused</option>
            <option value="completed" className="bg-[#1A1B1A] text-white">Completed</option>
          </select>
        </div>
      </div>

      {/* Campaigns Grid (#1A1B1A Surface Cards) */}
      {loading ? (
        <div className="bg-[#0E0E0E] rounded-2xl border border-white/10 p-12 text-center text-[#71717A] flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
          <span className="text-xs font-medium">Loading campaigns from database...</span>
        </div>
      ) : error ? (
        <div className="bg-[#0E0E0E] rounded-2xl border border-white/10 p-8 text-center text-white text-xs font-medium flex flex-col items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-[#0E0E0E] rounded-2xl border border-white/10 shadow-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto border border-white/15">
            <Send className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#FBFBFC]">No campaigns created yet</h3>
          <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
            {searchQuery || statusFilter
              ? 'No campaigns match your search criteria.'
              : 'Create your first email campaign with variable tags and follow-up schedules.'}
          </p>
          <button
            onClick={() => navigate('/dashboard/campaigns/new')}
            className="mt-2 primary-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
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
                className="bg-[#1A1B1A] rounded-2xl border border-white/10 shadow-2xl p-5 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-[#FBFBFC] leading-tight">
                      {campaign.name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${STATUS_BADGES[campaign.status] || 'bg-white/10 text-white border-white/15'}`}>
                      {campaign.status}
                    </span>
                  </div>

                  {campaign.subject && (
                    <p className="text-xs text-[#A1A1AA] font-mono line-clamp-1">
                      Subject: {campaign.subject}
                    </p>
                  )}
                </div>

                {/* Campaign Metrics Bar */}
                <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-[#A1A1AA]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#71717A]">
                      <Users className="w-3.5 h-3.5 text-white" /> Recipients:
                    </span>
                    <span className="font-semibold text-white">{recipientCount} contacts</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#71717A]">
                      <Clock className="w-3.5 h-3.5 text-white" /> Follow-ups:
                    </span>
                    <span className="font-semibold text-white">{followUpCount} steps</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#71717A] pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Created:
                    </span>
                    <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {campaign.status === 'running' ? (
                      <button
                        onClick={() => handlePauseCampaign(campaign._id)}
                        className="secondary-btn inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        <Pause className="w-3.5 h-3.5 text-white" />
                        Pause
                      </button>
                    ) : campaign.status === 'paused' ? (
                      <button
                        onClick={() => handleResumeCampaign(campaign._id)}
                        className="primary-btn inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        <Play className="w-3.5 h-3.5 text-black" />
                        Resume
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedCampaignForSend(campaign)}
                        className="primary-btn inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        <Play className="w-3.5 h-3.5 text-black" />
                        Send / Test
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/dashboard/campaigns/${campaign._id}`)}
                      className="p-1.5 text-[#71717A] hover:text-white hover:bg-white/10 rounded transition-colors"
                      title="Edit Campaign"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteCampaign(campaign._id, campaign.name)}
                    className="p-1.5 text-[#71717A] hover:text-white hover:bg-white/10 rounded transition-colors"
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
