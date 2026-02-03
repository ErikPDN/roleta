import { use, useEffect, useRef, useState } from "react";
import { Shuffle } from "lucide-react";

interface WheelProps {
  id: string;
  text: string;
  color: string;
}

const COLORS = [
  "#60A5FA",
  "#F87171",
  "#FB923C",
  "#34D399",
  "#A78BFA",
  "#FBBF24",
  "#EC4899",
  "#14B8A6",
];

export function Wheel() {
  const [items, setItems] = useState<WheelProps[]>([]);

  const [newItem, setNewItem] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedItem, setSelectedItem] = useState<WheelProps | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Desenha roleta
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || items.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    const sliceAngle = (2 * Math.PI) / items.length;

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Salva o estado e aplica rotação
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    // Desenha cada fatia
    items.forEach((item, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Desenha a fatia
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Desenha o texto
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(item.text, radius / 2, 0);
      ctx.restore();
    });

    ctx.restore();
  }, [items, rotation]);

  const addItem = () => {
    if (newItem.trim() === "") return;

    const newId = String(Date.now());
    const newColor = COLORS[items.length % COLORS.length];

    setItems([...items, { id: newId, text: newItem.trim(), color: newColor }]);
    setNewItem("");
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const spinWheel = () => {
    if (isSpinning || items.length === 0) return;

    setIsSpinning(true);
    setSelectedItem(null);

    const minSpins = 5;
    const maxSpins = 8;
    const spins = minSpins + Math.random() * (maxSpins - minSpins);
    const targetRotation = rotation + spins * 360 + Math.random() * 360;

    const duration = 4000;
    const startTime = Date.now();
    const initialRotation = rotation;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const currentRotation =
        initialRotation + (targetRotation - initialRotation) * easeOutProgress;

      setRotation(currentRotation % 360);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const normalizedRotation = (360 - (currentRotation % 360)) % 360;
        const sliceAngle = 360 / items.length;
        const selectedIndex =
          Math.floor(normalizedRotation / sliceAngle) % items.length;
        setSelectedItem(items[selectedIndex]);
      }
    };

    animate();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Roleta de Filmes
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Roleta */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Indicador */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div
                  className="w-0 h-10 border-l-[20px] border-l-transparent border-r-[20px] border-r-[20px]
                  border-r-transparent border-t-[30px] border-t-red-500 drop-shadow-lg"
                />
              </div>

              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="drop-shadow-2xl"
              />
            </div>

            <button
              onClick={spinWheel}
              disabled={isSpinning || items.length === 0}
              className={`mt-6 px-4 py-4 bg-blue-600 text-white font-bold text-xl 
                rounded-lg shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:transform-none`}
            >
              {isSpinning ? "Girando..." : "Girar Roleta"}
            </button>

            {selectedItem && (
              <div className="mt-6 p-6 bg-white rounded-lg shadow-lg border-4 border-green-500 animate-bounce">
                <p className="text-2xl font-bold text-center text-gray-800">
                  {selectedItem.text}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
