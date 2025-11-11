export default function AttemptToggle({ selectedAttempt, onAttemptChange }) {
  return (
    <div className="bg-gray-800 rounded-xl shadow-sm border border-teal-500/30 p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">Exam Attempt</h3>
          <p className="text-xs text-gray-400 mt-1">Compare your progress across attempts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAttemptChange(1)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedAttempt === 1
                ? 'bg-teal-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Attempt 1
          </button>
          <button
            onClick={() => onAttemptChange(2)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedAttempt === 2
                ? 'bg-teal-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Attempt 2 (Current)
          </button>
        </div>
      </div>
    </div>
  );
}
