import { useState, useRef } from "react";

const App = () => {
  const [script, setScript] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState("");
  const videoRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const bgStyle: React.CSSProperties = {
    backgroundImage:
      "url('https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=1600&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    mediaRecorderRef.current = new MediaRecorder(stream);
    recordedChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      setVideoURL(url);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleGenerate = async () => {
    if (!script) return;

    await startRecording();

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      stopRecording();
    };

    speechSynthesis.speak(utterance);
  };

  return (
    <div
      ref={videoRef}
      style={bgStyle}
      className="flex flex-col items-center justify-center p-6 text-white"
    >
      <div className="bg-black/70 p-6 rounded-2xl shadow-lg max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold mb-4">🎬 VideoScript AI</h1>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Enter your video script here..."
          className="w-full h-32 p-3 rounded-lg text-black"
        />
        <button
          onClick={handleGenerate}
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-800 rounded-lg text-white font-semibold"
        >
          🎤 Generate and Record
        </button>
      </div>

      {speaking && (
        <div className="mt-6 text-2xl font-semibold animate-fade-in">
          {script}
        </div>
      )}

      {videoURL && (
        <a
          href={videoURL}
          download="video-script.webm"
          className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-800 rounded-lg text-white"
        >
          ⬇️ Download Video
        </a>
      )}
    </div>
  );
};

export default App;
