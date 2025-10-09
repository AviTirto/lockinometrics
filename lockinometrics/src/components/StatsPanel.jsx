import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import dayjs from "dayjs";

export default function StatsPanel() {
  const [stats, setStats] = useState({
    longest: 0,
    weekly: 0,
    total: 0,
    longestDuration: 0,
    totalSessions: 0
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "sessions"), (snapshot) => {
      const sessions = snapshot.docs.map((d) => d.data());

      let longest = 0;
      let longestDuration = 0;
      let total = 0;
      let weekly = 0;

      // Total, longest session and longest duration
      for (const s of sessions) {
        total += s.hours;
        if (s.hours > longest) longest = s.hours;
        if (s.duration && s.duration > longestDuration) longestDuration = s.duration;
      }

      // Weekly hours (this week)
      const startOfWeek = dayjs().startOf("week");
      weekly = sessions
        .filter((s) => dayjs(s.createdAt.toDate()).isAfter(startOfWeek))
        .reduce((sum, s) => sum + s.hours, 0);

      setStats({
        longest: longest.toFixed(2),
        weekly: weekly.toFixed(2),
        total: total.toFixed(2),
        longestDuration,
        totalSessions: sessions.length
      });
    });

    return unsub;
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return "0h 0m";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-sm border border-teal-500/30 p-6">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">My Stats</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-gray-700">
          <span className="text-sm text-gray-300">This Week</span>
          <span className="font-semibold text-gray-100">{stats.weekly}h</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-700">
          <span className="text-sm text-gray-300">All Time</span>
          <span className="font-semibold text-gray-100">{stats.total}h</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-700">
          <span className="text-sm text-gray-300">Sessions</span>
          <span className="font-semibold text-gray-100">{stats.totalSessions}</span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-300">Longest Session</span>
          <span className="font-semibold text-gray-100">{formatDuration(stats.longestDuration)}</span>
        </div>
      </div>
    </div>
  );
}
