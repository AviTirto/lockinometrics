import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const activityIcons = {
  "practice-questions": "📝",
  "practice-exam": "📋",
  "lecture-video": "🎥",
  "notes-review": "📚"
};

const activityLabels = {
  "practice-questions": "Practice Questions",
  "practice-exam": "Practice Exams",
  "lecture-video": "Lecture Videos",
  "notes-review": "Notes Review"
};

const activityColors = {
  "practice-questions": "from-blue-500 to-blue-400",
  "practice-exam": "from-purple-500 to-purple-400",
  "lecture-video": "from-pink-500 to-pink-400",
  "notes-review": "from-teal-500 to-teal-400"
};

export default function ActivityBreakdown({ collectionName, borderColor = "border-teal-500/30" }) {
  const [activityData, setActivityData] = useState({});
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    const q = query(collection(db, collectionName));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const sessions = snapshot.docs.map((d) => d.data());

        const breakdown = {};
        let total = 0;

        sessions.forEach((session) => {
          const tag = session.activityTag || "practice-questions";
          if (!breakdown[tag]) {
            breakdown[tag] = 0;
          }
          breakdown[tag] += session.hours || 0;
          total += session.hours || 0;
        });

        setActivityData(breakdown);
        setTotalHours(total);
      },
      (error) => {
        console.error("Error fetching activity breakdown:", error);
      }
    );

    return unsub;
  }, [collectionName]);

  const activities = ["practice-questions", "practice-exam", "lecture-video", "notes-review"];

  return (
    <div className={`bg-gray-800 rounded-xl shadow-sm border ${borderColor} p-6 transition-colors duration-500`}>
      <h3 className="text-lg font-semibold text-gray-100 mb-4">Activity Breakdown</h3>
      <p className="text-sm text-gray-400 mb-6">Time spent by activity type</p>

      <div className="space-y-4">
        {activities.map((activity) => {
          const hours = activityData[activity] || 0;
          const percentage = totalHours > 0 ? (hours / totalHours) * 100 : 0;

          return (
            <div key={activity}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{activityIcons[activity]}</span>
                  <span className="text-sm text-gray-300">{activityLabels[activity]}</span>
                </div>
                <span className="text-sm font-semibold text-gray-100">
                  {hours.toFixed(1)}h
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${activityColors[activity]} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">Total Study Time</span>
          <span className="text-lg font-bold text-teal-400">
            {totalHours.toFixed(1)}h
          </span>
        </div>
      </div>
    </div>
  );
}
