import { useState } from "react";
import SessionForm from "./components/SessionForm";
import SessionList from "./components/SessionList";
import StatsPanel from "./components/StatsPanel";
import ExamCountdown from "./components/ExamCountdown";
import LofiPlayer from "./components/LofiPlayer";
import ProgressGraph from "./components/ProgressGraph";

function App() {
  const [reload, setReload] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-teal-500/30 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">😺</div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">lockinometrics</h1>
              <p className="text-xs text-gray-400">with Francine 🐾</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Big Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-7xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Hi Christina! 👋
          </h2>
          <p className="text-xl text-gray-300">Let's lock in and count those coins</p>
        </div>

        {/* Exam Countdown - Full Width */}
        <ExamCountdown />

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Timer Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <SessionForm onAdded={() => setReload(!reload)} />
          </div>

          {/* Stats Sidebar */}
          <div>
            <StatsPanel />
          </div>
        </div>

        {/* Progress Graph - Full Width */}
        <div className="mb-8">
          <ProgressGraph key={reload} />
        </div>

        {/* Sessions Feed */}
        <div className="mt-8">
          <SessionList key={reload} />
        </div>
      </main>

      {/* Lofi Music Player */}
      <LofiPlayer />

      {/* Francine the Cat - floating mascot */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="relative group">
          <div className="text-6xl animate-bounce cursor-pointer transform hover:scale-110 transition-transform">
            😺
          </div>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
            <div className="bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-teal-500/30 whitespace-nowrap">
              <p className="text-sm font-medium text-gray-200">Francine believes in you! 💕</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
