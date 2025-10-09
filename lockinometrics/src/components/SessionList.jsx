import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function SessionList() {
  const [sessions, setSessions] = useState([]);
  const [longestSession, setLongestSession] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "sessions"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const sessionData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSessions(sessionData);

      // Find longest session for PR badge
      const longest = Math.max(...sessionData.map(s => s.duration || 0));
      setLongestSession(longest);
    });
    return unsub;
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Recent Activities</h2>
      <div className="space-y-3">
        {sessions.length === 0 && (
          <div className="bg-gray-800 rounded-xl shadow-sm border border-teal-500/30 p-12 text-center">
            <div className="text-5xl mb-3">📚</div>
            <p className="text-gray-300">No sessions yet</p>
            <p className="text-sm text-gray-400 mt-1">Start a session to track your study time</p>
          </div>
        )}
        {sessions.map((s) => {
          const isPR = s.duration && s.duration === longestSession && longestSession > 0;
          return (
            <div
              key={s.id}
              className="bg-gray-800 rounded-xl shadow-sm border border-teal-500/30 p-5 hover:border-teal-500/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-100">{s.topic}</h3>
                    {isPR && (
                      <span className="px-2 py-0.5 bg-teal-900/50 text-teal-400 text-xs font-semibold rounded border border-teal-500/30">
                        PR
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p className="text-sm text-gray-300 mb-2">
                      {s.description}
                    </p>
                  )}
                  {s.motivation && (
                    <div className="bg-teal-900/30 border-l-2 border-teal-500 p-2 rounded-r mb-2">
                      <p className="text-xs text-gray-200 italic">{s.motivation}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDuration(s.duration)}
                    </span>
                    <span>•</span>
                    <span>{formatDate(s.createdAt)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-100">{s.hours}h</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
