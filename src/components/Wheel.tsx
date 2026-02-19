import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ModalOverlay } from "./ModalOverlay";
interface WheelProps {
  id: string;
  text: string;
  color: string;
}

// TODO: Pegar cor randomica de uma paleta
const COLORS = [
  "#60A5FA",
  "#F87171",
  "#FB923C",
  "#34D399",
  "#A78BFA",
  "#FACC15",
  "#EC4899",
  "#14B8A6",
];

export function Wheel() {
  const [items, setItems] = useState<WheelProps[]>([
    { id: "1", text: "Ilha do Medo", color: COLORS[0] },
    { id: "2", text: "O Poço", color: COLORS[1] },
    { id: "3", text: "Parasita", color: COLORS[2] },
  ]);

  const [newItem, setNewItem] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedItem, setSelectedItem] = useState<WheelProps | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Desenha roleta
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (items.length === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#D1D5DB";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }

    const sliceAngle = (2 * Math.PI) / items.length;

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
        // TODO: Adicionar confetti ao finalizar
        setIsSpinning(false);
        const finalNormalizedRotation =
          (360 - (currentRotation % 360) + 270) % 360;
        const sliceAngle = 360 / items.length;
        const selectedIndex =
          Math.floor(finalNormalizedRotation / sliceAngle) % items.length;
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
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-blue-50 flex flex-col">
      <div className="top-0 left-0 right-0 z-40 h-14 md:h-20 flex items-center justify-center bg-purple-50/80 backdrop-blur-sm">
        <h1 className="text-2xl mt-8 md:text-4xl xl:text-5xl font-bold text-gray-800">
          Roleta de Filmes
        </h1>
      </div>

      <main className="flex-1 flex items-center justify-center pt-14 md:pt-20 p-4 md:p-8 xl:p-12">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 xl:gap-16 2xl:gap-24">
          {/* Roleta */}
          <div
            className="flex flex-col items-center shrink-0"
            onClick={spinWheel}
          >
            <div className="relative">
              {/* Indicador */}
              <div className="absolute top-5 md:top-6 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div
                  className="w-0 h-10 border-l-20 border-l-transparent border-r-20
                  border-r-transparent border-t-30 border-t-red-500 drop-shadow-lg"
                />
              </div>

              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className="drop-shadow-2xl w-72 h-72 sm:w-96 sm:h-96 md:w-110 md:h-110 lg:w-130 lg:h-130 xl:w-160 xl:h-160 2xl:w-190 2xl:h-190"
              />
            </div>
          </div>

          {/* Controles */}
          <div className="bg-white rounded-xl shadow-lg p-6 xl:p-8 w-full sm:w-96 xl:w-[420px] 2xl:w-[500px] shrink-0">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Opções da Roleta
            </h2>

            {/* Adicionar Item */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adicionar novo filme
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                  placeholder="Digite um nome de um Filme"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-50 focus:border-transparent outline-none"
                />
                <button
                  onClick={addItem}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lista de Itens */}
            <div className="space-y-2 max-h-64 md:max-h-80 xl:max-h-[28rem] 2xl:max-h-[36rem] overflow-y-auto">
              <p className="text-sm font-medium text-gray-700 mb-2">Filmes</p>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 border bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="flex-1 text-gray-800 truncate">
                    {item.text}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-red-500 hover:bg-red-200 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {items.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Adicione itens para começar a girar a roleta!
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Modal Overlay*/}
      {selectedItem && (
        <ModalOverlay
          selectedItem={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
