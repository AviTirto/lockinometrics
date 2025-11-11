import { useState, useEffect } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function SessionForm({ onAdded }) {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [description, setDescription] = useState("");
  const [savedDuration, setSavedDuration] = useState(0);
  const [motivationMessage, setMotivationMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activityTag, setActivityTag] = useState("practice-questions");

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const handleStart = () => {
    setIsRunning(true);
    setStartTime(Date.now());
    setElapsedSeconds(0);
  };

  const handleStop = () => {
    if (!isRunning) return;
    setIsRunning(false);
    const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
    setSavedDuration(totalSeconds);
    setShowModal(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const hours = savedDuration / 3600;
    let aiMotivation = "";

    // Try to get AI motivation
    try {
      // Check if we're in production (use Netlify function) or dev (use direct OpenAI call)
      const isProduction = window.location.hostname !== 'localhost';

      if (isProduction) {
        // Production: use Netlify function
        const res = await fetch("/.netlify/functions/motivate", {
          method: "POST",
          body: JSON.stringify({
            topic: sessionName || "Untitled Session",
            hours: hours.toFixed(2),
            description: description || ""
          }),
        });

        if (res.ok) {
          const data = await res.json();
          aiMotivation = data.message;
          setMotivationMessage(data.message);
        }
      } else {
        // Development: call OpenAI directly from browser
        const OpenAI = (await import('openai')).default;
        const client = new OpenAI({
          apiKey: import.meta.env.VITE_OPENAI_API_KEY,
          dangerouslyAllowBrowser: true
        });

        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are Coach Avi, Christina's boxing coach, but she's fighting the CPA exam instead of an opponent. This is her SECOND attempt - she failed the first time but she's BACK IN THE RING ready to knock out the CPA. Use intense boxing metaphors and motivational language like a coach hyping up their fighter. Say things like 'You're throwing PUNCHES at the CPA!', 'That's how you go rounds with the exam!', 'The CPA thought you were down but you got back up!', 'You're hitting the CPA with combo after combo!'. Be energetic, intense, and motivating. Keep it to 2-3 sentences max. Make her feel like a CHAMPION who's coming back for REVENGE. Always end with '- Coach Avi 🥊'",
            },
            {
              role: "user",
              content: `Christina just finished a ${hours.toFixed(2)}-hour study session on ${sessionName || "Untitled Session"}.${description ? ` How she's feeling: "${description}".` : ''} Hype her up like a boxing coach! Acknowledge how she's feeling and celebrate the work she just put in. Use boxing metaphors and make her feel like she's beating up the CPA exam. End with '- Coach Avi 🥊'`,
            },
          ],
        });

        aiMotivation = completion.choices[0].message.content;
        setMotivationMessage(aiMotivation);
        console.log("AI motivation received:", aiMotivation);
      }
    } catch (error) {
      // Silently fail - AI is optional
      console.log("AI motivation unavailable:", error);
    }

    // Save to Firebase with motivation message and activity tag
    try {
      await addDoc(collection(db, "sessions2"), {
        topic: sessionName || "Untitled Session",
        hours: Number(hours.toFixed(2)),
        duration: savedDuration,
        description,
        motivation: aiMotivation,
        activityTag,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error saving session:", error);
      alert("Failed to save session. Please check your browser extensions or try incognito mode.");
      setIsSaving(false);
      return;
    }

    setIsSaving(false);

    // Don't close modal if we have a motivation message to show
    if (!aiMotivation) {
      // Reset form
      setSessionName("");
      setDescription("");
      setStartTime(null);
      setElapsedSeconds(0);
      setSavedDuration(0);
      setShowModal(false);
      onAdded();
    }
  };

  const handleCloseModal = () => {
    setSessionName("");
    setDescription("");
    setStartTime(null);
    setElapsedSeconds(0);
    setSavedDuration(0);
    setMotivationMessage("");
    setActivityTag("practice-questions");
    setShowModal(false);
    onAdded();
  };

  const handleDiscard = () => {
    setSessionName("");
    setDescription("");
    setStartTime(null);
    setElapsedSeconds(0);
    setSavedDuration(0);
    setActivityTag("practice-questions");
    setShowModal(false);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Main Timer Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg border-2 border-red-500/30 p-8">
        {!isRunning ? (
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🥊</div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
              Ready for another round?
            </h2>
            <p className="text-gray-300 mb-6">Step into the ring! 🔥</p>
            <button
              onClick={handleStart}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-4 px-8 rounded-full transition-all text-lg shadow-md hover:shadow-xl transform hover:scale-105"
            >
              Start Training 🥊
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-7xl font-mono font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4">
              {formatTime(elapsedSeconds)}
            </div>
            <p className="text-gray-300 mb-2">Training in progress</p>
            <p className="text-sm text-gray-400 mb-6">Keep throwing punches! 🔥</p>
            <button
              onClick={handleStop}
              className="bg-gradient-to-r from-red-400 to-orange-500 hover:from-red-500 hover:to-orange-600 text-white font-semibold py-4 px-8 rounded-full transition-all text-lg shadow-md hover:shadow-xl transform hover:scale-105"
            >
              End Round 🎯
            </button>
          </div>
        )}
      </div>

      {/* Modal for naming session */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-teal-500/30">
            {!motivationMessage ? (
              <>
                <h2 className="text-2xl font-bold text-gray-100 mb-2">Name Your Session</h2>
                <p className="text-gray-300 mb-1">Duration: {formatTime(savedDuration)}</p>
                <p className="text-sm text-gray-400 mb-6">
                  {(savedDuration / 3600).toFixed(2)} hours
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Session Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      placeholder="e.g., Morning Grind, Late Night Study..."
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      autoFocus
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Activity Type
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      value={activityTag}
                      onChange={(e) => setActivityTag(e.target.value)}
                      disabled={isSaving}
                    >
                      <option value="practice-questions">Practice Questions</option>
                      <option value="practice-exam">Practice Exam</option>
                      <option value="lecture-video">Lecture Video</option>
                      <option value="notes-review">Notes Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      How are you feeling? (optional)
                    </label>
                    <textarea
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
                      placeholder="How are you feeling about this session?"
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleDiscard}
                      className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                      disabled={isSaving}
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Session"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">🎉</div>
                  <h2 className="text-2xl font-bold text-gray-100 mb-2">Great Work!</h2>
                  <p className="text-gray-300">
                    {formatTime(savedDuration)} • {(savedDuration / 3600).toFixed(2)}h
                  </p>
                </div>

                <div className="bg-teal-900/30 border-l-4 border-teal-500 p-4 rounded-r-lg mb-6">
                  <p className="text-gray-200">{motivationMessage}</p>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="w-full px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
