import { useState } from "react";

const motivationMessages = [
  "That crusty white dog is waiting for you, Christina! Keep grinding for your fur baby! 🐶💪",
  "Picture this: YOU and your crusty white dog, living your best CPA life! 🐕✨",
  "Every hour you study gets you closer to adopting that crusty white pup! 🥊",
  "The crusty white dog shelter is calling your name, champ! Pass that CPA! 🔥",
  "Christina + CPA Pass + Crusty White Dog = PURE HAPPINESS! Let's go! 🎯",
  "That little crusty white furball is dreaming of you right now! Keep pushing! 🐶💕",
  "Study now, cuddle that crusty white dog later! You got this! 💯",
  "Every practice question brings you one belly rub closer to your crusty pup! 🐕",
  "The CPA is just standing between you and your crusty white dog! KNOCK IT OUT! 🥊",
  "Your future crusty white dog is rooting for you! Show that exam who's boss! ⭐",
  "Imagine coming home to your crusty white dog after passing the CPA! Keep training! 🏠🐶",
  "That crusty white dog needs a CPA mom! You're almost there, Christina! 🙏💪",
];

export default function MotivationButton({ selectedAttempt }) {
  const [showModal, setShowModal] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [images, setImages] = useState([]);

  const handleGetMotivation = async () => {
    // Get random message
    const randomMessage = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
    setCurrentMessage(randomMessage);

    // Try to load images from the motivation-images folder
    try {
      // Check for common image files (you'll drop images here)
      const imageNames = [
        "crustydog1.jpg", "crustydog2.jpg", "crustydog3.jpg", "crustydog4.jpg", "crustydog5.jpg",
        "crustydog6.jpg", "crustydog7.jpg", "crustydog8.jpg", "crustydog9.jpg", "crustydog10.jpg",
        "crustydog11.jpg", "crustydog12.jpg", "crustydog13.jpg", 
      ];

      // Filter to existing images
      const availableImages = [];
      for (const imgName of imageNames) {
        try {
          const response = await fetch(`/motivation-images/${imgName}`);
          if (response.ok) {
            availableImages.push(`/motivation-images/${imgName}`);
          }
        } catch (e) {
          // Image doesn't exist, skip it
        }
      }

      if (availableImages.length > 0) {
        const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
        setCurrentImage(randomImage);
      } else {
        setCurrentImage(""); // No images available
      }
    } catch (error) {
      console.log("No images found yet");
      setCurrentImage("");
    }

    setShowModal(true);
  };

  // Color scheme based on attempt
  const buttonGradient = selectedAttempt === 1
    ? "from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
    : "from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600";

  const borderColor = selectedAttempt === 1
    ? "border-teal-500/30"
    : "border-red-500/30";

  return (
    <>
      <button
        onClick={handleGetMotivation}
        className={`w-full bg-gradient-to-r ${buttonGradient} text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2`}
      >
        <span className="text-2xl">💪</span>
        <span>Get Motivated!</span>
      </button>

      {/* Motivation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className={`bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 border-2 ${borderColor} relative`}>
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl"
            >
              ×
            </button>

            {/* Image */}
            {currentImage ? (
              <div className="mb-4 rounded-lg overflow-hidden border-2 border-gray-700">
                <img
                  src={currentImage}
                  alt="Crusty Dog Motivation"
                  className="w-full h-auto object-cover max-h-64"
                />
              </div>
            ) : (
              <div className="mb-4 text-center text-5xl">
                🐶💕
              </div>
            )}

            {/* Message */}
            <div className={`bg-gradient-to-r ${buttonGradient.split('hover:')[0]} bg-opacity-20 border-l-4 ${borderColor.replace('border-', 'border-l-')} p-4 rounded-r-lg`}>
              <p className="text-lg font-bold text-gray-100 text-center">
                {currentMessage}
              </p>
            </div>

            {/* Instruction text if no images */}
            {!currentImage && (
              <p className="text-sm text-gray-400 text-center mt-4">
                Drop crusty dog images in <code className="bg-gray-700 px-2 py-1 rounded">public/motivation-images/</code> to see them here!
              </p>
            )}

            {/* Close button at bottom */}
            <button
              onClick={() => setShowModal(false)}
              className={`mt-4 w-full bg-gradient-to-r ${buttonGradient} text-white font-semibold py-2 px-4 rounded-lg transition-all`}
            >
              Let's Get Back to Work! 💪
            </button>
          </div>
        </div>
      )}
    </>
  );
}
