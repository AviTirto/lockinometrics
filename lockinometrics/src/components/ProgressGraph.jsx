import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function ProgressGraph() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "sessions"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const sessionData = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      setSessions(sessionData);
    });
    return unsub;
  }, []);

  // Calculate total hours
  const totalHours = sessions.reduce((sum, s) => sum + (s.hours || 0), 0);

  // Don't render if less than 1 hour total
  if (totalHours < 1) {
    return null;
  }

  // Group sessions by date and get last 7 days
  const groupedData = {};
  sessions.forEach(session => {
    if (!session.createdAt) return;
    const date = session.createdAt.toDate();
    const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (!groupedData[dateKey]) {
      groupedData[dateKey] = 0;
    }
    groupedData[dateKey] += session.hours || 0;
  });

  const dates = Object.keys(groupedData);
  const hours = Object.values(groupedData);

  // Get last 7 days
  const displayDates = dates.slice(-7);
  const displayHours = hours.slice(-7);

  // Calculate max for y-axis - use actual max from displayed data
  const actualMax = Math.max(...displayHours, 0);
  const maxHours = Math.ceil(actualMax) + 1;

  return (
    <div className="bg-gray-800 rounded-xl shadow-sm border border-teal-500/30 p-6">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">Progress Graph</h3>
      <p className="text-sm text-gray-300 mb-6">Daily study hours (last 7 days)</p>

      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-400">
          <span>{maxHours}h</span>
          <span>{Math.round(maxHours / 2)}h</span>
          <span>0h</span>
        </div>

        {/* Graph area */}
        <div className="ml-14 h-full pb-8 flex items-end justify-around gap-2">
          {displayHours.map((hour, index) => {
            const heightPercent = (hour / maxHours) * 100;
            return (
              <div key={displayDates[index]} className="flex-1 flex flex-col items-center h-full">
                {/* Bar container */}
                <div className="w-full flex flex-col justify-end items-center flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-teal-500 to-cyan-400 rounded-t-lg transition-all hover:from-teal-600 hover:to-cyan-500 relative group"
                    style={{ height: `${heightPercent}%`, minHeight: hour > 0 ? '8px' : '0' }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 border border-teal-500/30 text-gray-100 text-xs px-2 py-1 rounded whitespace-nowrap">
                        {hour.toFixed(1)}h
                      </div>
                    </div>
                  </div>
                </div>

                {/* X-axis label */}
                <div className="text-xs text-gray-300 mt-2 text-center whitespace-nowrap">
                  {displayDates[index]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-300">Total hours tracked:</span>
          <span className="font-semibold text-teal-400">
            {totalHours.toFixed(1)}h
          </span>
        </div>
      </div>
    </div>
  );
}
