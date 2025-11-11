import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const activityColors = {
  "practice-questions": { from: "from-blue-500", to: "to-blue-400", bg: "bg-blue-500" },
  "practice-exam": { from: "from-purple-500", to: "to-purple-400", bg: "bg-purple-500" },
  "lecture-video": { from: "from-pink-500", to: "to-pink-400", bg: "bg-pink-500" },
  "notes-review": { from: "from-teal-500", to: "to-teal-400", bg: "bg-teal-500" }
};

const activityLabels = {
  "practice-questions": "Practice Questions",
  "practice-exam": "Practice Exam",
  "lecture-video": "Lecture Video",
  "notes-review": "Notes Review"
};

export default function ProgressGraph({ selectedAttempt, borderColor = "border-teal-500/30" }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const collectionName = selectedAttempt === 1 ? "sessions" : "sessions2";
    const q = query(collection(db, collectionName), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const sessionData = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        setSessions(sessionData);
      },
      (error) => {
        console.error("Error fetching progress graph data:", error);
      }
    );
    return unsub;
  }, [selectedAttempt]);

  // Calculate total hours
  const totalHours = sessions.reduce((sum, s) => sum + (s.hours || 0), 0);

  // Don't render if less than 1 hour total
  if (totalHours < 1) {
    return null;
  }

  // Group sessions by date and activity tag
  const groupedData = {};
  sessions.forEach(session => {
    if (!session.createdAt) return;
    const date = session.createdAt.toDate();
    const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const activityTag = session.activityTag || "practice-questions";

    if (!groupedData[dateKey]) {
      groupedData[dateKey] = {
        total: 0,
        "practice-questions": 0,
        "practice-exam": 0,
        "lecture-video": 0,
        "notes-review": 0
      };
    }
    groupedData[dateKey][activityTag] += session.hours || 0;
    groupedData[dateKey].total += session.hours || 0;
  });

  const dates = Object.keys(groupedData);

  // Get last 7 days
  const displayDates = dates.slice(-7);
  const displayData = displayDates.map(date => groupedData[date]);

  // Calculate max for y-axis
  const actualMax = Math.max(...displayData.map(d => d.total), 0);
  const maxHours = Math.ceil(actualMax) + 1;

  return (
    <div className={`bg-gray-800 rounded-xl shadow-sm border ${borderColor} p-6 transition-colors duration-500`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">Progress Graph</h3>
          <p className="text-sm text-gray-300 mt-1">Daily study hours (last 7 days)</p>
        </div>

        {/* Legend - Only show for Attempt 2 */}
        {selectedAttempt === 2 && (
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <span className="text-gray-300">Practice Q's</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
              <span className="text-gray-300">Practice Exam</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-pink-500 rounded-sm"></div>
              <span className="text-gray-300">Lecture Video</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-teal-500 rounded-sm"></div>
              <span className="text-gray-300">Notes Review</span>
            </div>
          </div>
        )}
      </div>

      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-400">
          <span>{maxHours}h</span>
          <span>{Math.round(maxHours / 2)}h</span>
          <span>0h</span>
        </div>

        {/* Graph area */}
        <div className="ml-14 h-full pb-8 flex items-end justify-around gap-2">
          {displayData.map((dayData, index) => {
            const totalHeight = (dayData.total / maxHours) * 100;

            // Calculate stacked segments
            const activities = ["practice-questions", "practice-exam", "lecture-video", "notes-review"];
            const segments = [];
            let cumulativePercent = 0;

            activities.forEach(activity => {
              const hours = dayData[activity] || 0;
              if (hours > 0) {
                const segmentPercent = (hours / dayData.total) * 100;
                segments.push({
                  activity,
                  hours,
                  percent: segmentPercent,
                  start: cumulativePercent
                });
                cumulativePercent += segmentPercent;
              }
            });

            return (
              <div key={displayDates[index]} className="flex-1 flex flex-col items-center h-full">
                {/* Bar container */}
                <div className="w-full flex flex-col justify-end items-center flex-1">
                  <div
                    className="w-full relative group flex flex-col-reverse overflow-hidden rounded-t-lg"
                    style={{ height: `${totalHeight}%`, minHeight: dayData.total > 0 ? '8px' : '0' }}
                  >
                    {/* Stacked segments */}
                    {segments.map((segment, segIdx) => (
                      <div
                        key={segIdx}
                        className={`w-full ${activityColors[segment.activity].bg} transition-all`}
                        style={{ height: `${segment.percent}%` }}
                      />
                    ))}

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 border border-teal-500/30 text-gray-100 text-xs px-3 py-2 rounded whitespace-nowrap">
                        <div className="font-semibold mb-1">{dayData.total.toFixed(1)}h total</div>
                        {segments.map((segment, segIdx) => (
                          <div key={segIdx} className="flex items-center gap-2">
                            <div className={`w-2 h-2 ${activityColors[segment.activity].bg} rounded-sm`}></div>
                            <span>{activityLabels[segment.activity]}: {segment.hours.toFixed(1)}h</span>
                          </div>
                        ))}
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
