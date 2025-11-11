import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import dayjs from "dayjs";

export default function StatsPanel({ selectedAttempt, borderColor = "border-teal-500/30" }) {
  const [stats, setStats] = useState({
    longest: 0,
    weekly: 0,
    total: 0,
    longestDuration: 0,
    totalSessions: 0
  });

  const [comparisonStats, setComparisonStats] = useState(null);

  useEffect(() => {
    // Determine which collection to use
    const collectionName = selectedAttempt === 1 ? "sessions" : "sessions2";
    const otherCollectionName = selectedAttempt === 1 ? "sessions2" : "sessions";

    const unsub = onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
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
      },
      (error) => {
        console.error("Error fetching stats:", error);
      }
    );

    // Fetch comparison stats from the other attempt
    const unsubOther = onSnapshot(
      collection(db, otherCollectionName),
      (snapshot) => {
        const sessions = snapshot.docs.map((d) => d.data());
        const total = sessions.reduce((sum, s) => sum + (s.hours || 0), 0);
        setComparisonStats({
          total: total.toFixed(2),
          totalSessions: sessions.length
        });
      },
      (error) => {
        console.error("Error fetching comparison stats:", error);
      }
    );

    return () => {
      unsub();
      unsubOther();
    };
  }, [selectedAttempt]);

  const formatDuration = (seconds) => {
    if (!seconds) return "0h 0m";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const hoursToGo = comparisonStats ? Math.max(0, parseFloat(comparisonStats.total) - parseFloat(stats.total)) : 0;

  return (
    <div className={`bg-gray-800 rounded-xl shadow-sm border ${borderColor} p-6 transition-colors duration-500`}>
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

      {/* Comparison Section */}
      {comparisonStats && selectedAttempt === 2 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold text-gray-100 mb-3">
            Comparison to Attempt 1
          </h3>
          <div className="space-y-2">
            <div className="bg-teal-900/20 border border-teal-500/30 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Previous Total</p>
              <p className="text-lg font-bold text-gray-100">{comparisonStats.total}h</p>
            </div>
            {hoursToGo > 0 ? (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Hours to Beat</p>
                <p className="text-lg font-bold text-blue-400">{hoursToGo.toFixed(1)}h</p>
              </div>
            ) : (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                <p className="text-xs text-green-400 font-semibold">
                  You've already beaten your previous hours! 🎉
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
