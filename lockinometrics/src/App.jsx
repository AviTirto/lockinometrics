import { useState } from "react";
import SessionForm from "./components/SessionForm";
import SessionList from "./components/SessionList";
import StatsPanel from "./components/StatsPanel";
import ExamCountdown from "./components/ExamCountdown";
import LofiPlayer from "./components/LofiPlayer";
import ProgressGraph from "./components/ProgressGraph";
import AttemptToggle from "./components/AttemptToggle";
import ActivityBreakdown from "./components/ActivityBreakdown";
import MotivationButton from "./components/MotivationButton";

function App() {
  const [reload, setReload] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(2); // Default to current attempt

  // Color scheme based on selected attempt
  const bgGradient = selectedAttempt === 1
    ? "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800"
    : "bg-gradient-to-br from-gray-900 via-red-950 to-orange-950";

  const headerBorder = selectedAttempt === 1
    ? "border-teal-500/30"
    : "border-red-500/30";

  const titleGradient = selectedAttempt === 1
    ? "from-teal-400 to-cyan-400"
    : "from-red-400 to-orange-400";

  const welcomeGradient = selectedAttempt === 1
    ? "from-teal-400 via-cyan-400 to-blue-400"
    : "from-red-400 via-orange-400 to-yellow-400";

  const borderColor = selectedAttempt === 1
    ? "border-teal-500/30"
    : "border-red-500/30";

  return (
    <div className={`min-h-screen ${bgGradient} transition-colors duration-500`}>
      {/* Header */}
      <header className={`bg-gray-800/80 backdrop-blur-sm border-b ${headerBorder} sticky top-0 z-40 transition-colors duration-500`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{selectedAttempt === 1 ? "😺" : "🥊"}</div>
            <div>
              <h1 className={`text-2xl font-bold bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent transition-colors duration-500`}>
                {selectedAttempt === 1 ? "lockinometrics" : "The Comeback"}
              </h1>
              <p className="text-xs text-gray-400">
                {selectedAttempt === 1 ? "with Francine 🐾" : "Round 2 - Fight! 🔥"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Big Welcome Message */}
        <div className="text-center mb-8">
          <h2 className={`text-7xl font-bold bg-gradient-to-r ${welcomeGradient} bg-clip-text text-transparent mb-3 transition-colors duration-500`}>
            {selectedAttempt === 1 ? "Hi Christina! 👋" : "Let's Go Champ! 🥊"}
          </h2>
          <p className="text-xl text-gray-300">
            {selectedAttempt === 1
              ? "Let's lock in and count those coins"
              : "Time to knock out the CPA - Round 2!"}
          </p>
        </div>

        {/* Exam Countdown - Full Width */}
        <ExamCountdown />

        {/* Attempt Toggle */}
        <AttemptToggle
          selectedAttempt={selectedAttempt}
          onAttemptChange={setSelectedAttempt}
        />

        {/* Motivation Button */}
        <div className="mb-6">
          <MotivationButton selectedAttempt={selectedAttempt} />
        </div>

        {selectedAttempt === 2 ? (
          // Attempt 2 Layout: Timer + Stats + Activity Breakdown
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <SessionForm onAdded={() => setReload(!reload)} />
            </div>
            <div>
              <StatsPanel selectedAttempt={selectedAttempt} borderColor={borderColor} />
            </div>
            <div className="lg:col-span-3">
              <ActivityBreakdown collectionName="sessions2" borderColor={borderColor} />
            </div>
          </div>
        ) : (
          // Attempt 1 Layout: Stats + Activity Breakdown side by side
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div>
              <StatsPanel selectedAttempt={selectedAttempt} borderColor={borderColor} />
            </div>
            <div>
              <ActivityBreakdown collectionName="sessions" borderColor={borderColor} />
            </div>
          </div>
        )}

        {/* Progress Graph - Full Width */}
        <div className="mb-8">
          <ProgressGraph selectedAttempt={selectedAttempt} borderColor={borderColor} key={`${reload}-${selectedAttempt}`} />
        </div>

        {/* Sessions Feed */}
        <div className="mt-8">
          <SessionList selectedAttempt={selectedAttempt} borderColor={borderColor} key={`${reload}-${selectedAttempt}`} />
        </div>

      </main>

      {/* Lofi Music Player */}
      <LofiPlayer />

      {/* Floating mascot */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="relative group">
          <div className="text-6xl animate-bounce cursor-pointer transform hover:scale-110 transition-transform">
            {selectedAttempt === 1 ? "😺" : "🥊"}
          </div>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
            <div className={`bg-gray-800 px-3 py-2 rounded-lg shadow-lg border ${selectedAttempt === 1 ? "border-teal-500/30" : "border-red-500/30"} whitespace-nowrap`}>
              <p className="text-sm font-medium text-gray-200">
                {selectedAttempt === 1
                  ? "Francine believes in you! 💕"
                  : "You're a champion! Keep fighting! 🔥"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
