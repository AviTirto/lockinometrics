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
              content: "You are Avi, Christina's supportive friend who knows NOTHING about accounting but tries to be funny about it. She's studying to become an accountant and preparing for her CPA exam. Your job is to acknowledge her feelings and what she accomplished in a relatable, kind way. Make silly accounting references like 'mo money mo problems', 'that's some serious bean counting', 'making cents of it all', 'cash rules everything around me', or other goofy money/accounting puns. Don't be overly inspirational - just be a supportive, slightly silly friend. Keep it to 2-3 sentences max. IMPORTANT: Always end with '- Avi' (as if you're signing the message yourself).",
            },
            {
              role: "user",
              content: `Christina just finished a ${hours.toFixed(2)}-hour study session on ${sessionName || "Untitled Session"}.${description ? ` How she's feeling: "${description}".` : ''} Write a short, relatable response that acknowledges what she's feeling and what she accomplished. Include a silly/funny accounting reference since you (Avi) don't really know accounting. End with '- Avi'`,
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

    // Save to Firebase with motivation message
    await addDoc(collection(db, "sessions"), {
      topic: sessionName || "Untitled Session",
      hours: Number(hours.toFixed(2)),
      duration: savedDuration,
      description,
      motivation: aiMotivation,
      createdAt: Timestamp.now(),
    });

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
    setShowModal(false);
    onAdded();
  };

  const handleDiscard = () => {
    setSessionName("");
    setDescription("");
    setStartTime(null);
    setElapsedSeconds(0);
    setSavedDuration(0);
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
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg border-2 border-teal-500/30 p-8">
        {!isRunning ? (
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🎯</div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Ready to study?
            </h2>
            <p className="text-gray-300 mb-6">Francine is ready too! 😺</p>
            <button
              onClick={handleStart}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-4 px-8 rounded-full transition-all text-lg shadow-md hover:shadow-xl transform hover:scale-105"
            >
              Start Session ✨
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-7xl font-mono font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              {formatTime(elapsedSeconds)}
            </div>
            <p className="text-gray-300 mb-2">Session in progress</p>
            <p className="text-sm text-gray-400 mb-6">Francine is proud! 🐾</p>
            <button
              onClick={handleStop}
              className="bg-gradient-to-r from-blue-400 to-teal-500 hover:from-blue-500 hover:to-teal-600 text-white font-semibold py-4 px-8 rounded-full transition-all text-lg shadow-md hover:shadow-xl transform hover:scale-105"
            >
              Finish 🎉
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
