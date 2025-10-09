import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function ExamCountdown() {
  const [isOpen, setIsOpen] = useState(true);
  const [totalHours, setTotalHours] = useState(0);
  const [targetHours, setTargetHours] = useState(30);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(30);
  const examDate = new Date("2025-10-23T09:00:00"); // October 23, 2025 at 9 AM

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "sessions"), (snapshot) => {
      const total = snapshot.docs.reduce((sum, doc) => sum + doc.data().hours, 0);
      setTotalHours(total);
    });
    return unsub;
  }, []);

  const now = new Date();
  const daysUntilExam = Math.max(0, Math.ceil((examDate - now) / (1000 * 60 * 60 * 24)));

  const hoursRemaining = Math.max(0, targetHours - totalHours);
  const hoursPerDay = daysUntilExam > 0 ? (hoursRemaining / daysUntilExam).toFixed(1) : 0;
  const progressPercent = Math.min(100, (totalHours / targetHours) * 100);

  const handleSaveGoal = () => {
    if (tempGoal > 0) {
      setTargetHours(tempGoal);
      setIsEditingGoal(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-sm border border-teal-500/30 mb-6 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-100">CPA Exam Prep</h3>
            <p className="text-sm text-gray-300">{daysUntilExam} days until exam</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-700">
          <div className="space-y-4 mt-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300">Study Progress</span>
                {!isEditingGoal ? (
                  <button
                    onClick={() => {
                      setIsEditingGoal(true);
                      setTempGoal(targetHours);
                    }}
                    className="text-sm font-semibold text-teal-600 hover:text-teal-700 underline"
                  >
                    {totalHours.toFixed(0)} / {targetHours}h
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={tempGoal}
                      onChange={(e) => setTempGoal(Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-gray-700 border border-teal-500 rounded text-sm text-gray-100"
                      min="1"
                    />
                    <button
                      onClick={handleSaveGoal}
                      className="text-xs bg-teal-500 text-white px-2 py-1 rounded hover:bg-teal-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingGoal(false)}
                      className="text-xs text-gray-400 hover:text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{progressPercent.toFixed(0)}% complete</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-teal-900/30 p-4 rounded-lg border border-teal-500/30">
                <div className="text-2xl font-bold text-teal-400">{hoursRemaining.toFixed(0)}h</div>
                <div className="text-xs text-gray-300">Hours Remaining</div>
              </div>

              <div className="bg-cyan-900/30 p-4 rounded-lg border border-cyan-500/30">
                <div className="text-2xl font-bold text-cyan-400">{hoursPerDay}h/day</div>
                <div className="text-xs text-gray-300">Daily Target</div>
              </div>
            </div>

            {/* Exam Date */}
            <div className="bg-gray-700/50 p-4 rounded-lg text-center border border-gray-600">
              <div className="text-sm text-gray-300 mb-1">Exam Date</div>
              <div className="font-semibold text-gray-100">
                {examDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            {/* Motivational Message */}
            {hoursPerDay > 0 && (
              <div className="bg-blue-900/30 border-l-4 border-blue-500 p-3 rounded-r-lg">
                <p className="text-sm text-gray-200">
                  {hoursPerDay < 3
                    ? "You're on track! Keep up the great work! 💪"
                    : hoursPerDay < 5
                    ? "Push a little harder - you've got this! 🔥"
                    : "Time to lock in! Break it into focused sessions. 🎯"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
