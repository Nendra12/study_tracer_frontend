import React, { useEffect, useMemo, useState } from "react";
import { RefreshCcw, ArrowRight } from "lucide-react";

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1493244040629-496f6d136cc3?auto=format&fit=crop&w=900&q=80",
];

const PUZZLE_SIZE = 54;
const TRACK_WIDTH = 360;
const TOLERANCE = 6;

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export default function PuzzleCaptcha({ onVerified, disabled = false, className = "" }) {
  const [bgImage, setBgImage] = useState(BG_IMAGES[0]);
  const [pieceX, setPieceX] = useState(0);
  const [targetX, setTargetX] = useState(180);
  const [pieceY, setPieceY] = useState(54);
  const [verified, setVerified] = useState(false);
  const [status, setStatus] = useState("Geser potongan ke posisi yang tepat");

  const maxSlide = TRACK_WIDTH - PUZZLE_SIZE;

  const resetPuzzle = () => {
    const nextImage = BG_IMAGES[randomBetween(0, BG_IMAGES.length - 1)];
    setBgImage(nextImage);
    setPieceX(0);
    setTargetX(randomBetween(120, maxSlide - 20));
    setPieceY(randomBetween(24, 95));
    setVerified(false);
    setStatus("Geser potongan ke posisi yang tepat");
  };

  useEffect(() => {
    resetPuzzle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (disabled) {
      resetPuzzle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  const handleSliderChange = (event) => {
    if (verified || disabled) return;
    setPieceX(Number(event.target.value));
  };

  const handleVerify = () => {
    if (verified || disabled) return;
    const matched = Math.abs(pieceX - targetX) <= TOLERANCE;

    if (!matched) {
      setStatus("Belum pas, coba lagi");
      setTimeout(() => resetPuzzle(), 600);
      return;
    }

    const token = `puzzle_${Date.now()}_${targetX}_${pieceX}`;
    setVerified(true);
    setStatus("Verifikasi berhasil");
    onVerified?.(token);
  };

  const progressWidth = useMemo(() => `${pieceX + PUZZLE_SIZE / 2}px`, [pieceX]);

  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <p className="text-lg font-medium text-gray-700">Drag To Verify</p>
        <button
          type="button"
          onClick={resetPuzzle}
          disabled={disabled || verified}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh captcha"
        >
          <RefreshCcw size={20} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="relative w-full h-[170px] rounded-md border border-gray-200 overflow-hidden bg-gray-100">
          <img src={bgImage} alt="Captcha background" className="w-full h-full object-cover select-none pointer-events-none" draggable={false} />

          <div
            className="absolute border-2 border-white/85 bg-white/35 shadow-inner"
            style={{
              left: `${targetX}px`,
              top: `${pieceY}px`,
              width: `${PUZZLE_SIZE}px`,
              height: `${PUZZLE_SIZE}px`,
              clipPath: "polygon(0 0, 58% 0, 58% 18%, 82% 18%, 82% 42%, 100% 42%, 100% 100%, 0 100%)",
            }}
          />

          <div
            className="absolute border-2 border-white/90 shadow-lg"
            style={{
              left: `${pieceX}px`,
              top: `${pieceY}px`,
              width: `${PUZZLE_SIZE}px`,
              height: `${PUZZLE_SIZE}px`,
              backgroundImage: `url(${bgImage})`,
              backgroundSize: `${TRACK_WIDTH}px 170px`,
              backgroundPosition: `-${targetX}px -${pieceY}px`,
              clipPath: "polygon(0 0, 58% 0, 58% 18%, 82% 18%, 82% 42%, 100% 42%, 100% 100%, 0 100%)",
              filter: verified ? "none" : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
            }}
          />
        </div>

        <div className="relative h-[56px] rounded-md border border-gray-300 overflow-hidden bg-[#f6f8fb]">
          <div className="absolute inset-y-0 left-0 bg-[#b9d2ea] transition-all duration-100" style={{ width: progressWidth }} />

          <input
            type="range"
            min="0"
            max={maxSlide}
            value={pieceX}
            onChange={handleSliderChange}
            disabled={disabled || verified}
            className="absolute inset-0 w-full opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed"
          />

          <button
            type="button"
            onClick={handleVerify}
            disabled={disabled || verified}
            className="absolute top-0 h-full w-[58px] bg-[#1f9cf0] text-white flex items-center justify-center shadow-md z-30 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ left: `${pieceX}px` }}
          >
            <ArrowRight size={22} />
          </button>
        </div>

        <p className={`text-xs font-semibold ${verified ? "text-emerald-600" : "text-gray-500"}`}>{status}</p>
      </div>
    </div>
  );
}
