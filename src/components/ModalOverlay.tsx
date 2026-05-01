import { X } from "lucide-react";
import { useRef, useEffect } from "react";
import { Confetti } from "./Confetti";

interface ModalOverlayProps {
  selectedItem: { text: string };
  onClose: () => void;
}

export function ModalOverlay({ selectedItem, onClose }: ModalOverlayProps) {
  const winAudio = useRef(new Audio("/win.mp3"));

  useEffect(() => {
    
  }, []);

  useEffect(() => {
    if (selectedItem) {
      winAudio.current.volume = 0.8;
      winAudio.current.currentTime = 0;
      winAudio.current.play().catch(() => {});
    }
  }, [selectedItem]);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 background-blur-xs"
      onClick={onClose}
    >
      <Confetti />

      <div
        className="relative bg-white rounded-2xl shadow-2xl p-10 w-150 h-50 text-center transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full 
          transition-all duration-200"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex justify-start flex-col items-start">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            O Filme Sorteado foi:
          </h2>
          <p className="text-4xl font-black text-gray-800 mt-4">
            {selectedItem.text}
          </p>
        </div>
      </div>
    </div>
  );
}
