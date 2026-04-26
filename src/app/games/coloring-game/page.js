"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useSound } from "@/contexts/SoundContext";
import { useGame } from "@/contexts/GameContext";
import { Lightbulb, XCircle } from "lucide-react";
import Link from "next/link";

const COLORS = ["#D63031","#6C5CE7","#00B894","#FDCB6E","#E84393","#74B9FF","#e17055","#00cec9","#2d3436","#FFFFFF"];
const SHAPES = [
  {name:"Star",path:"M50,5 L61,35 L95,35 L68,57 L79,91 L50,70 L21,91 L32,57 L5,35 L39,35 Z"},
  {name:"Heart",path:"M50,85 C20,65 0,45 0,25 C0,10 15,0 30,0 C40,0 48,8 50,15 C52,8 60,0 70,0 C85,0 100,10 100,25 C100,45 80,65 50,85 Z"},
  {name:"House",path:"M50,5 L95,45 L80,45 L80,90 L20,90 L20,45 L5,45 Z"},
  {name:"Flower",path:"M50,30 C60,10 80,10 80,30 C100,30 100,50 80,50 C80,70 60,70 50,50 C40,70 20,70 20,50 C0,50 0,30 20,30 C20,10 40,10 50,30 Z"},
];

export default function ColoringPage() {
  const {playSound}=useSound();
  const {playGame}=useGame();
  const [selectedColor,setSelectedColor]=useState(COLORS[0]);
  const [selectedShape,setSelectedShape]=useState(0);
  const [fills,setFills]=useState({});
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const svgRef = useRef(null);

  const colorSection=(id)=>{
    playSound("pop");
    setFills(f=>({...f,[id]:selectedColor}));
    playGame("coloring-game");
  };

  const clear=()=>setFills({});

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-lg mx-auto text-center relative">
        <div className="flex items-center justify-between mb-4">
          <Link href="/games" className="text-sm text-primary font-bold hover:underline inline-block">← Back to Games</Link>
          <button onClick={() => setShowHowToPlay(!showHowToPlay)} className="p-2 rounded-full bg-pink/20 text-pink-dark hover:bg-pink/30 transition-colors">
            <Lightbulb size={20} />
          </button>
        </div>

        {showHowToPlay && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-pink/10 p-4 rounded-2xl border border-pink/30 text-left relative">
            <button onClick={() => setShowHowToPlay(false)} className="absolute top-2 right-2 text-pink-dark hover:text-danger"><XCircle size={16}/></button>
            <h3 className="font-bold text-pink-dark flex items-center gap-2 mb-1"><Lightbulb size={16}/> How to Play</h3>
            <p className="text-sm text-[var(--muted)]">Pick a color from the palette below and click anywhere inside the shape or the small circles to color them! Be as creative as you want!</p>
          </motion.div>
        )}

        <h1 className="text-3xl font-black mb-2">🎨 Coloring Game</h1>
        <p className="text-[var(--muted)] mb-6">Pick a color and click on the shape to color it!</p>

        {/* Shape selector */}
        <div className="flex justify-center gap-3 mb-4">
          {SHAPES.map((s,i)=>(
            <button key={i} onClick={()=>{setSelectedShape(i);setFills({});playSound("click");}}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedShape===i?'bg-primary text-white':'bg-[var(--surface)] border border-[var(--border-color)]'}`}>
              {s.name}
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6 mb-6">
          <svg ref={svgRef} viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto">
            <rect width="300" height="300" fill="none"/>
            {/* Main shape */}
            <g transform="translate(50,50) scale(2)">
              <path d={SHAPES[selectedShape].path} fill={fills["main"]||"#f0f0f0"} stroke="#333" strokeWidth="2"
                className="cursor-pointer hover:opacity-80 transition-opacity" onClick={()=>colorSection("main")}/>
            </g>
            {/* Background circles as secondary targets */}
            {[{cx:40,cy:40,id:"c1"},{cx:260,cy:40,id:"c2"},{cx:40,cy:260,id:"c3"},{cx:260,cy:260,id:"c4"},{cx:150,cy:280,id:"c5"}].map(c=>(
              <circle key={c.id} cx={c.cx} cy={c.cy} r="20" fill={fills[c.id]||"#f0f0f0"} stroke="#333" strokeWidth="1.5"
                className="cursor-pointer hover:opacity-80 transition-opacity" onClick={()=>colorSection(c.id)}/>
            ))}
          </svg>
        </div>

        {/* Color palette */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {COLORS.map(c=>(
            <motion.button key={c} whileTap={{scale:0.8}} onClick={()=>{setSelectedColor(c);playSound("click");}}
              className={`w-10 h-10 rounded-xl border-3 transition-all ${selectedColor===c?'ring-2 ring-primary ring-offset-2 scale-110':'border-[var(--border-color)]'}`}
              style={{backgroundColor:c,borderColor:c==="#FFFFFF"?"#ddd":"transparent"}}/>
          ))}
        </div>

        <button onClick={clear} className="text-sm text-danger font-bold hover:underline">Clear All</button>
      </div>
    </div>
  );
}
