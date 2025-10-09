import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function MedalPanel() {
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "sessions"), (snapshot) => {
      const total = snapshot.docs.reduce((sum, doc) => sum + doc.data().hours, 0);
      setTotalHours(total);
    });
    return unsub;
  }, []);

  const medals = [
    { id: 1, name: "Getting Started", icon: "🥉", req: 5 },
    { id: 2, name: "Building Momentum", icon: "🥈", req: 25 },
    { id: 3, name: "Study Warrior", icon: "🥇", req: 50 },
    { id: 4, name: "Marathon Mindset", icon: "🏅", req: 100 },
    { id: 5, name: "CPA Champion", icon: "👑", req: 200 },
  ];

  return (
    <div className="p-6 border border-yellow-200 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <span className="text-3xl">🏅</span> Achievements
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {medals.map((medal) => {
          const unlocked = totalHours >= medal.req;
          const progress = Math.min((totalHours / medal.req) * 100, 100);
          return (
            <div
              key={medal.id}
              className={`p-4 border-2 rounded-xl text-center transition-all transform hover:scale-105 ${
                unlocked
                  ? "bg-white border-yellow-400 shadow-md"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="text-4xl mb-2">{unlocked ? medal.icon : "🔒"}</div>
              <p className="font-semibold text-sm text-gray-800">{medal.name}</p>
              <p className="text-xs text-gray-600 mt-1">
                {unlocked
                  ? `✓ ${medal.req}h`
                  : `${totalHours.toFixed(0)} / ${medal.req}h`}
              </p>
              {!unlocked && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
