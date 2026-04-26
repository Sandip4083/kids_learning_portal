"use client";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useSound } from "@/contexts/SoundContext";
import { useGame } from "@/contexts/GameContext";
import { Lightbulb, XCircle } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

function genCard() {
  const n = []; while (n.length < 25) { const v = Math.floor(Math.random()*50)+1; if (!n.includes(v)) n.push(v); } return n;
}
function genQ() {
  const ops=["+","-","×"], op=ops[Math.floor(Math.random()*3)];
  let a,b,ans;
  if(op==="+"){a=Math.floor(Math.random()*30)+1;b=Math.floor(Math.random()*20)+1;ans=a+b;}
  else if(op==="-"){a=Math.floor(Math.random()*30)+20;b=Math.floor(Math.random()*20)+1;ans=a-b;}
  else{a=Math.floor(Math.random()*10)+1;b=Math.floor(Math.random()*8)+1;ans=a*b;}
  return {text:`${a} ${op} ${b}`,answer:ans};
}

export default function BingoPage() {
  const {playSound}=useSound();
  const {addXp,playGame}=useGame();
  const [card,setCard]=useState(()=>genCard());
  const [marked,setMarked]=useState(new Set([12]));
  const [question,setQuestion]=useState(genQ);
  const [userAns,setUserAns]=useState("");
  const [won,setWon]=useState(false);
  const [msg,setMsg]=useState("");
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const checkBingo=useCallback((m)=>{
    const lines=[];
    for(let i=0;i<5;i++){lines.push([i*5,i*5+1,i*5+2,i*5+3,i*5+4]);lines.push([i,i+5,i+10,i+15,i+20]);}
    lines.push([0,6,12,18,24],[4,8,12,16,20]);
    return lines.some(l=>l.every(idx=>m.has(idx)));
  },[]);

  const submit=()=>{
    const a=parseInt(userAns);
    if(a===question.answer){
      playSound("correct");
      const idx=card.indexOf(a);
      if(idx!==-1&&!marked.has(idx)){
        const nm=new Set(marked);nm.add(idx);setMarked(nm);
        if(checkBingo(nm)){setWon(true);confetti({particleCount:150,spread:80});playSound("levelup");addXp(15);playGame("bingo");}
        setMsg("✅ Correct! Marked!");
      } else setMsg("✅ Correct! Not on card.");
    } else {playSound("wrong");setMsg(`❌ Answer was ${question.answer}`);}
    setUserAns("");setQuestion(genQ());
  };

  const reset=()=>{setCard(genCard());setMarked(new Set([12]));setQuestion(genQ());setWon(false);setMsg("");};

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto text-center relative">
        <div className="flex items-center justify-between mb-4">
          <Link href="/games" className="text-sm text-primary font-bold hover:underline inline-block">← Back to Games</Link>
          <button onClick={() => setShowHowToPlay(!showHowToPlay)} className="p-2 rounded-full bg-orange/20 text-orange-dark hover:bg-orange/30 transition-colors">
            <Lightbulb size={20} />
          </button>
        </div>

        {showHowToPlay && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-orange/10 p-4 rounded-2xl border border-orange/30 text-left relative">
            <button onClick={() => setShowHowToPlay(false)} className="absolute top-2 right-2 text-orange-dark hover:text-danger"><XCircle size={16}/></button>
            <h3 className="font-bold text-orange-dark flex items-center gap-2 mb-1"><Lightbulb size={16}/> How to Play</h3>
            <p className="text-sm text-[var(--muted)]">Solve the math problem. If the answer is on your Bingo board, it gets marked! Mark 5 squares in a row (horizontal, vertical, or diagonal) to yell BINGO!</p>
          </motion.div>
        )}

        <h1 className="text-3xl font-black mb-2">🎯 Math Bingo</h1>
        <p className="text-[var(--muted)] mb-6">Solve math to mark your card!</p>
        <div className="inline-grid grid-cols-5 gap-1.5 mb-6">
          {card.map((num,i)=>(
            <div key={i} className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold border-2 ${i===12?'bg-accent text-white border-accent':marked.has(i)?'bg-primary text-white border-primary':'bg-[var(--surface)] border-[var(--border-color)]'}`}>
              {i===12?"⭐":num}
            </div>
          ))}
        </div>
        {!won&&(
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-color)] p-6 mb-4">
            <p className="text-lg font-bold mb-4">Solve: <span className="text-primary text-2xl">{question.text}</span></p>
            <div className="flex gap-2">
              <input type="number" value={userAns} onChange={e=>setUserAns(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--border-color)] outline-none focus:border-primary font-bold text-center text-lg" placeholder="?"/>
              <button onClick={submit} className="px-6 py-3 rounded-xl bg-primary text-white font-bold">Go!</button>
            </div>
          </div>
        )}
        {msg&&<p className="text-sm font-bold mb-4">{msg}</p>}
        {won&&<motion.p initial={{scale:0}} animate={{scale:1}} className="text-3xl font-black text-secondary mb-4">🎉 BINGO!</motion.p>}
        <button onClick={reset} className="text-sm text-primary font-bold hover:underline">New Game</button>
      </div>
    </div>
  );
}
