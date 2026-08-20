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
  sent: { label: 'Email Sent', icon: Send, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  opened: { label: 'Email Opened (Estimated)', icon: Eye, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  clicked: { label: 'Link Clicked', icon: MousePointer, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  replied: { label: 'Recipient Replied', icon: MessageSquareReply, color: 'text-emerald-700 bg-emerald-100 border-emerald-300' },
  failed: { label: 'Sending Failed', icon: AlertCircle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  bounced: { label: 'Email Bounced', icon: AlertCircle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
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
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">{contact.name}</h3>
            <p className="text-xs font-mono text-slate-500">{contact.email}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Notice */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            Open events represent estimated pixel renders. Open tracking is not guaranteed as email clients may block or prefetch images.
          </span>
        </div>

        {/* Activity Timeline List */}
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            Loading contact engagement timeline...
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs text-center font-medium">
            {error}
          </div>
        ) : activity.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 space-y-1">
            <Clock className="w-6 h-6 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No activity recorded yet</p>
            <p>Outreach events will appear here as campaign emails are dispatched.</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            {activity.map((event) => {
              const config = EVENT_CONFIGS[event.eventType] || { label: event.eventType, icon: Clock, color: 'bg-slate-100' };
              const Icon = config.icon;

              return (
                <div 
                  key={event._id}
                  className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-lg border ${config.color} shrink-0 mt-0.5`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{config.label}</span>
                      {event.emailId?.subject && (
                        <span className="text-slate-500 font-mono text-[11px] block truncate max-w-xs">
                          {event.emailId.subject}
                        </span>
                      )}
                      {event.metadata?.url && (
                        <span className="text-blue-600 font-mono text-[10px] block truncate max-w-xs">
                          URL: {event.metadata.url}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1 justify-end text-slate-600">
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

        <div className="pt-2 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
}
