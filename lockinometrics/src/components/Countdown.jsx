import { useEffect, useState } from "react";

export default function Countdown() {
  const targetDate = new Date("2025-10-23T00:00:00");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, mins: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft({ days, hours, mins });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center mb-6 p-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-3 flex items-center justify-center gap-2">
        <span>⏰</span> CPA Exam Countdown
      </h2>
      <div className="flex justify-center gap-4">
        <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
          <div className="text-3xl font-bold text-white">{timeLeft.days}</div>
          <div className="text-xs text-white/90">days</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
          <div className="text-3xl font-bold text-white">{timeLeft.hours}</div>
          <div className="text-xs text-white/90">hours</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
          <div className="text-3xl font-bold text-white">{timeLeft.mins}</div>
          <div className="text-xs text-white/90">minutes</div>
        </div>
      </div>
    </div>
  );
}
