import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Eye, 
  MousePointer, 
  MessageSquareReply, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Loader2,
  Calendar,
  Info
} from 'lucide-react';
import { getContactActivity } from '../services/api';

const EVENT_CONFIGS = {
  sent: { label: 'Email Sent', icon: Send, color: 'text-white bg-[#262626] border-white/10' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-white bg-[#262626] border-white/10' },
  opened: { label: 'Email Opened (Estimated)', icon: Eye, color: 'text-white bg-[#262626] border-white/10' },
  clicked: { label: 'Link Clicked', icon: MousePointer, color: 'text-white bg-[#262626] border-white/10' },
  replied: { label: 'Recipient Replied', icon: MessageSquareReply, color: 'text-black bg-white border-white font-bold' },
  failed: { label: 'Sending Failed', icon: AlertCircle, color: 'text-white bg-[#262626] border-white/10' },
  bounced: { label: 'Email Bounced', icon: AlertCircle, color: 'text-white bg-[#262626] border-white/10' },
};

export default function ContactActivityModal({ contact, isOpen, onClose }) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && contact) {
      fetchActivity();
    }
  }, [isOpen, contact]);

  const fetchActivity = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getContactActivity(contact._id);
      setActivity(data.activity || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load contact activity');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#0E0E0E] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white/10 space-y-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#FBFBFC]">{contact.name}</h3>
            <p className="text-xs font-mono text-[#A1A1AA]">{contact.email}</p>
          </div>
          <button onClick={onClose} className="text-[#71717A] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Notice */}
        <div className="p-3.5 rounded-xl bg-[#1A1B1A] border border-white/10 text-xs text-[#A1A1AA] flex items-start gap-2">
          <Info className="w-4 h-4 text-white shrink-0 mt-0.5" />
          <span>
            Open events represent estimated pixel renders. Open tracking is not guaranteed as email clients may block or prefetch images.
          </span>
        </div>

        {/* Activity Timeline List */}
        {loading ? (
          <div className="p-8 text-center text-xs text-[#71717A] flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-white" />
            Loading contact engagement timeline...
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-[#1A1B1A] text-white text-xs text-center font-medium border border-white/10">
            {error}
          </div>
        ) : activity.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#71717A] space-y-1">
            <Clock className="w-6 h-6 mx-auto text-[#71717A]" />
            <p className="font-semibold text-[#FBFBFC]">No activity recorded yet</p>
            <p>Outreach events will appear here as campaign emails are dispatched.</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            {activity.map((event) => {
              const config = EVENT_CONFIGS[event.eventType] || { label: event.eventType, icon: Clock, color: 'bg-[#262626] text-white border-white/10' };
              const Icon = config.icon;

              return (
                <div 
                  key={event._id}
                  className="p-3 bg-[#1A1B1A] rounded-xl border border-white/10 flex items-start justify-between gap-3 text-xs hover:bg-[#262626] transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-lg border ${config.color} shrink-0 mt-0.5`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[#FBFBFC] block">{config.label}</span>
                      {event.emailId?.subject && (
                        <span className="text-[#A1A1AA] font-mono text-[11px] block truncate max-w-xs">
                          {event.emailId.subject}
                        </span>
                      )}
                      {event.metadata?.url && (
                        <span className="text-white font-mono text-[10px] block truncate max-w-xs">
                          URL: {event.metadata.url}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-[11px] text-[#71717A] font-mono">
                    <div className="flex items-center gap-1 justify-end text-[#A1A1AA]">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.timestamp).toLocaleDateString()}
                    </div>
                    <div>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2 border-t border-white/10 text-right">
          <button
            onClick={onClose}
            className="secondary-btn px-4 py-1.5 rounded-xl text-xs font-semibold"
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
}
