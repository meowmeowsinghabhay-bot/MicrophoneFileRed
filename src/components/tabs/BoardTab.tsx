"use client";

import { useRef, useState } from "react";
import { useLectureStore } from "@/store/lectureStore";

function detectMediaType(imageData: string): string {
  const match = imageData.match(/^data:(image\/\w+);base64,/);
  return match?.[1] || "image/jpeg";
}

export default function BoardTab() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const boardCaptures = useLectureStore((s) => s.boardCaptures);
  const addBoardCapture = useLectureStore((s) => s.addBoardCapture);

  const startCamera = async () => {
    setError(null);
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch {
      setError(
        "Could not access camera. Allow camera permission in your browser, or upload an image instead."
      );
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureFromCamera = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) {
      setError("Camera is still starting. Wait a second and try again.");
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.85);
    setPreview(imageData);
    await analyzeImage(imageData);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const imageData = reader.result as string;
      setPreview(imageData);
      await analyzeImage(imageData);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const analyzeImage = async (imageData: string) => {
    setLoading(true);
    setError(null);
    setWarning(null);

    try {
      const res = await fetch("/api/analyze-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData,
          mediaType: detectMediaType(imageData),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze image");
      }

      if (data.warning) setWarning(data.warning);

      addBoardCapture({
        id: `${Date.now()}`,
        imageData,
        description: data.description || "No description available",
        latex: data.latex,
        timestamp: Date.now(),
      });
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {!cameraActive ? (
          <button
            onClick={startCamera}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Open Camera
          </button>
        ) : (
          <>
            <button
              onClick={captureFromCamera}
              disabled={loading}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Capture Board"}
            </button>
            <button
              onClick={stopCamera}
              className="rounded-lg border border-app px-4 py-2 text-sm text-app transition hover:bg-app-secondary"
            >
              Close Camera
            </button>
          </>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="rounded-lg border border-app px-4 py-2 text-sm text-app transition hover:bg-app-secondary disabled:opacity-50"
        >
          Upload Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {warning && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {warning}
        </div>
      )}

      {cameraActive && (
        <div className="relative overflow-hidden rounded-xl border border-app bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full" />
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />

      {preview && (
        <div className="rounded-xl border border-app p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="max-h-48 rounded-lg" />
          {loading && (
            <p className="mt-2 text-center text-sm text-app-muted">
              Analyzing image… this may take a few seconds
            </p>
          )}
        </div>
      )}

      {boardCaptures.length > 0 && (
        <div className="flex-1 space-y-3 overflow-y-auto">
          <h3 className="text-sm font-semibold text-app">
            Captured Boards ({boardCaptures.length})
          </h3>
          {boardCaptures.map((capture) => (
            <div
              key={capture.id}
              className="rounded-xl border border-app bg-app-card p-4"
            >
              <div className="mb-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={capture.imageData}
                  alt="Board capture"
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <span className="text-xs text-app-muted">
                  {new Date(capture.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-app">
                {capture.description}
              </p>
              {capture.latex && (
                <p className="mt-2 rounded bg-app-secondary p-2 font-mono text-xs text-app">
                  {capture.latex}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {boardCaptures.length === 0 && !cameraActive && !loading && (
        <div className="flex flex-1 flex-col items-center justify-center text-app-muted">
          <div className="mb-4 text-5xl">📷</div>
          <p>Capture board snapshots during the lecture</p>
          <p className="mt-1 text-xs">Use camera or upload an image</p>
          <p className="mt-2 text-xs text-center">
            Without OpenAI credits, free OCR extracts text only (no diagram/formula AI)
          </p>
        </div>
      )}
    </div>
  );
}
