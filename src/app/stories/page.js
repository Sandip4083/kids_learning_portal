"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/contexts/SoundContext";
import { useGame } from "@/contexts/GameContext";
import { stories } from "@/data/stories";
import { Volume2, VolumeX, Bookmark, BookmarkCheck, Heart, Sparkles, Wand2, RefreshCw } from "lucide-react";

// ============ AI STORY GENERATOR ============
const STORY_THEMES = [
  { theme: "space", setting: "in a distant galaxy", characters: ["astronaut", "alien", "robot"], emoji: "🚀" },
  { theme: "ocean", setting: "deep under the ocean", characters: ["mermaid", "dolphin", "octopus"], emoji: "🌊" },
  { theme: "forest", setting: "in an enchanted forest", characters: ["fairy", "talking fox", "wise owl"], emoji: "🌲" },
  { theme: "city", setting: "in a futuristic city", characters: ["inventor kid", "flying car", "helpful drone"], emoji: "🏙️" },
  { theme: "mountain", setting: "on top of a magical mountain", characters: ["young explorer", "snow leopard", "golden eagle"], emoji: "🏔️" },
  { theme: "desert", setting: "in a vast magical desert", characters: ["brave camel", "sand fairy", "wise cactus"], emoji: "🏜️" },
];

const STORY_TEMPLATES = [
  {
    title: (char, setting) => `The ${char}'s Epic Journey ${setting}`,
    generate: (char, setting, theme) => ({
      paragraphs: [
        `Once upon a time, ${setting}, the world was quiet and peaceful. In this wondrous place lived a young ${char} who always felt a deep yearning for something greater. Every single morning, as the first light broke across the horizon, the ${char} would sit and stare into the distance, wondering what mysteries lay hidden beyond the edge of their known world. The wind seemed to whisper ancient secrets, and the stars at night sparkled like breadcrumbs leading to an unknown destiny.`,
        `The ${char}'s daily routine was simple but fulfilling. They would gather supplies, help their neighbors, and listen to the elders tell grand tales of heroes from the past. But the stories only fueled the fire in their heart. "Is there more to life than this?" the ${char} would often ask themselves, sighing softly. "I know I have a purpose, I just have to find it."`,
        `One unusually bright morning, while exploring a forbidden part of the terrain, the ${char} stumbled upon something extraordinary. Half-buried in the ground was a glowing, pulsating ${theme === "space" ? "crystal of starlight" : theme === "ocean" ? "pearl of the deep" : theme === "forest" ? "enchanted flower" : "ancient key"}. It hummed with a strange, magical energy. As soon as the ${char} touched it, a burst of light filled the air, and a map magically appeared before their eyes.`,
        `"This must be a sign!" the ${char} exclaimed, their heart pounding with excitement and fear. They quickly packed a small bag with provisions, took a deep breath, and set off into the unknown. The journey was not easy. The path was steep, the weather was unpredictable, and strange noises echoed in the shadows. But the glowing object in their pocket gave them courage to press on.`,
        `After several days of travel, the ${char} encountered a peculiar stranger—a wise old creature who had been watching them from afar. "You carry a great power," the stranger rasped, pointing a gnarly finger at the ${char}'s pocket. "But power alone is not enough. You must pass three trials to prove your worth." The ${char} nodded bravely, ready to face whatever lay ahead.`,
        `The first trial tested their courage. A massive, terrifying beast blocked a narrow mountain pass. Instead of fighting, the ${char} noticed the beast was simply nursing a wounded paw. With great care and kindness, the ${char} helped bandage the wound, and the grateful beast let them pass peacefully. The second trial tested their intellect: a complex riddle guarding an ancient door. The ${char} thought for hours, finally realizing the answer lay in a simple song from their childhood.`,
        `The final trial was the hardest. It tested their heart. The ${char} had to choose between keeping the magical object to gain immense personal power or giving it up to save a struggling village they had just discovered. Without hesitation, the ${char} placed the glowing object into the center of the village. Instantly, the land flourished, water flowed clearly, and the people rejoiced.`,
        `As the ${char} stood watching the happy villagers, they realized the true meaning of their journey. The magic wasn't in the object; the magic was in the choices they made and the courage they showed. The elders back home had been right all along—true heroes are made not by what they take from the world, but by what they give.`,
        `Word of the ${char}'s brave deeds spread far and wide, ${setting}. They were no longer just a dreamer looking at the horizon; they had become the very legend the elders would tell stories about for generations to come.`,
        `And so, the ${char} returned home, forever changed. They knew there would be more adventures in the future, but for now, they were content. They had found their purpose: to be a beacon of hope and kindness in a world that desperately needed both.`
      ],
      moral: "True heroism isn't about power or keeping magic for yourself; it's about making selfless choices to help others and leaving the world better than you found it.",
    }),
  },
  {
    title: (char, setting) => `The Great Mystery of the Vanishing ${char}`,
    generate: (char, setting, theme) => ({
      paragraphs: [
        `It was a day like any other ${setting}, until a sudden, shocking discovery sent a wave of panic through the community. The most beloved ${char} in the entire realm had completely vanished! Nobody knew where they had gone, and the sudden disappearance left a cold emptiness in everyone's hearts.`,
        `A young, unlikely hero stepped forward from the trembling crowd. "I will find the ${char}!" they declared loudly, their voice echoing in the sudden silence. Some laughed, pointing out how small and inexperienced the hero was. But the young hero's eyes burned with determination. They packed a meager satchel with a crust of bread, a flask of water, and an unwavering belief in their mission.`,
        `The search began at the last place the ${char} was seen—a mysterious clearing filled with strange footprints. The young hero knelt down, examining the tracks carefully. "These don't lead away from the village," they muttered to themselves, "they lead deep into the Whispering Caverns." The caverns were known to be a place of immense danger, where shadows played tricks on the mind.`,
        `As the hero ventured deeper into the darkness, the air grew incredibly cold. Suddenly, a voice boomed from the shadows. "Who dares enter my domain?" A giant creature, made entirely of stone and moss, stepped into the dim light. "I am looking for the ${char}," the young hero said, trying to keep their voice steady. "Please, let me pass."`,
        `The stone creature laughed, a sound like grinding boulders. "You may pass only if you can make me smile. I have guarded this cavern for a thousand years, and I have forgotten what joy feels like." The young hero thought quickly. They began to tell a hilarious story about a clumsy frog they had seen the day before. They acted it out, jumping and croaking until, slowly, a rumble started in the stone creature's chest.`,
        `The rumble turned into a chuckle, and the chuckle into a booming roar of laughter. The creature wiped a tear from its rocky eye. "Thank you, little one. You have a good heart. The ${char} is just ahead, but be careful—they are trapped in a crystal cage that only opens with a selfless act."`,
        `The young hero hurried forward and gasped. There, inside a shimmering, impenetrable crystal, sat the ${char}. "I'm so glad you're here!" the ${char} cried. "I was trying to fetch a rare medicinal herb for the village elders and got trapped." The hero remembered the stone creature's words: 'a selfless act'.`,
        `The hero realized what they had to do. They took out their flask of water—their only source of hydration for the long journey back—and poured it over the drooping medicinal herb growing next to the cage. As the water touched the roots, the plant bloomed brilliantly, and the crystal cage shattered into a million sparkling pieces.`,
        `Reunited at last, the ${char} and the young hero made their way back to the community. When they arrived, the cheers were deafening. The ${char} made sure everyone knew that it wasn't strength or magic that saved the day, but the young hero's cleverness and selfless heart.`,
        `From that day on, no one ever doubted the young hero again. They had proven that even the smallest among us can accomplish the greatest of deeds, provided their intentions are pure and their heart is brave.`
      ],
      moral: "True strength comes from a pure heart and a selfless spirit, and even the smallest person can make a massive difference.",
    }),
  },
  {
    title: (char, setting) => `How the Quiet ${char} Saved the Day`,
    generate: (char, setting, theme) => ({
      paragraphs: [
        `Life ${setting} was usually predictable and calm. Among the bustling crowds and loud voices, there was one ${char} who was extremely quiet. This ${char} never shouted, never demanded attention, and often went unnoticed by the louder, more boastful members of the community. They preferred to observe, to listen, and to think deeply about the world around them.`,
        `"Why don't you ever speak up?" a loud companion asked the ${char} one afternoon. The ${char} simply smiled gently and pointed to a small bird building a complex nest. "There is much to learn if you only watch and listen," they replied softly. The companion rolled their eyes and walked away, dismissing the quiet ${char}'s wisdom.`,
        `But peace is a fragile thing. One day, the sky turned an eerie shade of purple, and a terrible, unforeseen disaster struck. A massive, magical storm began to brew, threatening to destroy everything they held dear. Panic erupted. The loudest members of the community yelled contradictory orders, running in circles, achieving nothing but chaos.`,
        `While everyone else was panicking, the quiet ${char} stood still. They closed their eyes, feeling the wind, listening to the crackle of the magical energy, and observing the patterns of the storm clouds. They remembered an old text they had read in the dusty archives—a text everyone else had ignored because it was 'too boring'.`,
        `The ${char} began to work quickly and silently. Using discarded materials, strange glowing rocks they had collected over the years, and a deep understanding of natural magic, they started building a complex contraption. Hours passed, the storm grew fiercer, and the winds howled like angry wolves.`,
        `Just as the storm was about to unleash its full fury upon them, the ${char} placed the final piece into their machine. It hummed to life, projecting a massive, shimmering shield over the entire area. The magical lightning crashed against the shield, crackling violently, but the shield held firm.`,
        `The community watched in awe as the storm raged outside, while they remained perfectly safe inside the glowing dome. The loud voices were finally silenced, replaced by gasps of wonder. When the storm finally broke and the sky cleared, the shield gently faded away.`,
        `The once-dismissive companion walked up to the quiet ${char}, their head hung low in shame. "I'm sorry I ever doubted you," they said humbly. "You saved us all. How did you know what to do?"`,
        `The ${char} smiled their gentle smile once more. "I knew because I took the time to listen when others were talking, to read when others were playing, and to observe when others were rushing. The answers are always there, if you are quiet enough to hear them."`,
        `From that monumental day forward, the community changed. They learned to value the quiet thinkers just as much as the loud doers. And the quiet ${char}? They went back to observing the world, knowing that sometimes, the quietest voices carry the most powerful magic of all.`
      ],
      moral: "Never underestimate someone because they are quiet. Observation, listening, and deep thinking are often more powerful than loud words.",
    }),
  },
];

function generateAIStory(themeChoice = null) {
  const theme = themeChoice || STORY_THEMES[Math.floor(Math.random() * STORY_THEMES.length)];
  const template = STORY_TEMPLATES[Math.floor(Math.random() * STORY_TEMPLATES.length)];
  const character = theme.characters[Math.floor(Math.random() * theme.characters.length)];

  const { paragraphs, moral } = template.generate(character, theme.setting, theme.theme);

  return {
    id: `ai-${Date.now()}`,
    title: template.title(character, theme.setting),
    paragraphs,
    moral,
    tags: [theme.theme, "AI-generated", "adventure"],
    readTime: "4 min",
    isAI: true,
    emoji: theme.emoji,
    theme: theme.theme,
  };
}

export default function StoriesPage() {
  const { playSound } = useSound();
  const { readStory, visitSection, bookmarks, toggleBookmark, stopTimeTracking, addXp } = useGame();
  
  const [expandedStory, setExpandedStory] = useState(null);
  const [speaking, setSpeaking] = useState(null);
  const [speakingLang, setSpeakingLang] = useState(null);
  const [translating, setTranslating] = useState(false);
  const activeSpeechRef = useRef(null);
  
  const [aiStories, setAiStories] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);

  useEffect(() => {
    visitSection("stories");
    return () => {
      stopTimeTracking();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [visitSection, stopTimeTracking]);

  const translateText = async (text, targetLang = 'hi') => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout
      
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await res.json();
      return data[0].map(item => item[0]).join('');
    } catch (error) {
      console.error("Translation failed or timed out:", error);
      return text;
    }
  };

  const speakStory = async (story, lang = 'en-US') => {
    if ("speechSynthesis" in window) {
      if (speaking === story.id && speakingLang === lang) {
        window.speechSynthesis.cancel();
        setSpeaking(null);
        setSpeakingLang(null);
        activeSpeechRef.current = null;
        return;
      }

      window.speechSynthesis.cancel();
      
      // Unlock speech synthesis synchronously on user interaction (fixes iOS/Chrome async block)
      const unlock = new SpeechSynthesisUtterance(' ');
      unlock.volume = 0;
      window.speechSynthesis.speak(unlock);

      setSpeaking(story.id);
      setSpeakingLang(lang);
      // eslint-disable-next-line react-hooks/purity
      const currentSession = Date.now();
      activeSpeechRef.current = currentSession;
      
      let sentences = [];
      if (lang === 'en-US') {
        sentences = [`${story.title}.`, ...story.paragraphs, `Moral: ${story.moral}`];
      } else {
        setTranslating(true);
        try {
          const allText = [`${story.title}.`, ...story.paragraphs, `Moral: ${story.moral}`];
          // Translate all chunks in parallel for maximum speed
          const translations = await Promise.all(allText.map(text => translateText(text, 'hi')));
          
          if (activeSpeechRef.current !== currentSession) {
            setTranslating(false);
            return;
          }
          sentences = translations;
        } catch (e) {
          console.error(e);
          sentences = [`${story.title}.`, ...story.paragraphs, `Moral: ${story.moral}`];
        }
        setTranslating(false);
      }

      if (activeSpeechRef.current !== currentSession) return;

      const voices = await new Promise(resolve => {
        let v = window.speechSynthesis.getVoices();
        if (v.length) resolve(v);
        else {
          window.speechSynthesis.onvoiceschanged = () => resolve(window.speechSynthesis.getVoices());
          setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500);
        }
      });

      const targetVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));

      let currentIndex = 0;
      
      const speakNext = () => {
        if (activeSpeechRef.current !== currentSession || currentIndex >= sentences.length) {
          if (currentIndex >= sentences.length && activeSpeechRef.current === currentSession) {
             setSpeaking(null);
             setSpeakingLang(null);
             activeSpeechRef.current = null;
          }
          return;
        }

        const u = new SpeechSynthesisUtterance(sentences[currentIndex]);
        u.lang = lang;
        u.rate = 0.85;
        u.pitch = 1.1;
        if (targetVoice) u.voice = targetVoice;

        u.onend = () => {
           currentIndex++;
           speakNext();
        };
        
        u.onerror = () => {
           console.error("SpeechSynthesis Error:", u);
           currentIndex++;
           speakNext();
        };

        window.speechSynthesis.speak(u);
      };

      // Start the sequential playback
      speakNext();
    }
  };

  const handleExpand = (story) => {
    if (expandedStory === story.id) {
      setExpandedStory(null);
      // Stop audio when collapsing
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setSpeaking(null);
      setSpeakingLang(null);
      activeSpeechRef.current = null;
      setTranslating(false);
    } else {
      const wasSpeaking = speaking;
      const lastLang = speakingLang;
      
      setExpandedStory(story.id);
      readStory(story.id);
      playSound("pop");
      
      // If a story was playing, stop it and auto-play the new one in the same language!
      if (wasSpeaking && wasSpeaking !== story.id) {
        // A small timeout allows the UI to expand first
        setTimeout(() => speakStory(story, lastLang || 'en-US'), 100);
      } else {
        // Just stop any lingering speech
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        setSpeaking(null);
        setSpeakingLang(null);
        activeSpeechRef.current = null;
        setTranslating(false);
      }
    }
  };

  const generateNewStory = useCallback((theme = null) => {
    setGenerating(true);
    playSound("click");

    // Simulate AI thinking time
    setTimeout(() => {
      const newStory = generateAIStory(theme);
      setAiStories((prev) => [newStory, ...prev.slice(0, 4)]); // Keep last 5 AI stories
      setExpandedStory(newStory.id);
      addXp(5); // Small XP for generating a story
      setGenerating(false);
      playSound("levelup");
    }, 1500);
  }, [playSound, addXp]);

  const allStories = [...aiStories, ...stories];

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2">📚 Story Time</h1>
          <p className="text-[var(--muted)]">Read exciting stories or generate new ones with AI!</p>
        </motion.div>

        {/* AI Story Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary via-pink to-accent rounded-3xl p-6 sm:p-8 text-white mb-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            {/* Generate exactly 15 static particles once via key indexing or mapping */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{ left: `${(i * 13) % 100}%`, top: `${(i * 17) % 100}%` }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2 + (i % 2), repeat: Infinity, delay: (i % 2) }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={24} />
              <h2 className="text-2xl font-black">AI Story Generator</h2>
            </div>
            <p className="text-white/80 mb-5">Choose a theme and let AI create a magical story just for you!</p>

            {/* Theme selector */}
            <div className="flex flex-wrap gap-2 mb-5">
              {STORY_THEMES.map((theme) => (
                <button
                  key={theme.theme}
                  onClick={() => setSelectedTheme(theme)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all touch-target ${
                    selectedTheme?.theme === theme.theme
                      ? "bg-white text-primary"
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  {theme.emoji} {theme.theme.charAt(0).toUpperCase() + theme.theme.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={() => generateNewStory(selectedTheme)}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-primary font-bold hover:shadow-lg transition-all touch-target disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Creating story...
                </>
              ) : (
                <>
                  <Wand2 size={18} /> Generate Story
                </>
              )}
            </button>

            {aiStories.length > 0 && (
              <p className="text-white/60 text-xs mt-3">✨ {aiStories.length} AI stories generated (+5 XP each!)</p>
            )}
          </div>
        </motion.div>

        {/* AI Loading Skeleton */}
        {generating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--surface)] rounded-3xl border border-[var(--border-color)] p-6 mb-6"
          >
            <div className="story-ai-loading w-3/4 h-6 mb-4" />
            <div className="story-ai-loading w-full" />
            <div className="story-ai-loading w-full" />
            <div className="story-ai-loading w-5/6" />
            <div className="story-ai-loading w-2/3 mt-4" />
          </motion.div>
        )}

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allStories.map((story, i) => {
            const isExpanded = expandedStory === story.id;
            const isBookmarked = bookmarks.includes(`story-${story.id}`);
            const isAI = story.isAI;

            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.5) }}
                layout
                className={`bg-[var(--surface)] rounded-3xl border overflow-hidden shadow-sm hover:shadow-lg transition-all ${
                  isExpanded ? "md:col-span-2" : ""
                } ${isAI ? "border-primary/30" : "border-[var(--border-color)]"}`}
              >
                {/* Image or AI Badge */}
                {isAI ? (
                  <div
                    className="relative h-48 overflow-hidden cursor-pointer bg-gradient-to-br from-primary to-pink flex items-center justify-center"
                    onClick={() => handleExpand(story)}
                  >
                    <div className="text-center text-white">
                      <span className="text-6xl block mb-2">{story.emoji}</span>
                      <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                        ✨ AI Generated
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg">{story.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white/70 text-xs">{story.readTime} read</span>
                        {story.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => handleExpand(story)}>
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg">{story.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white/70 text-xs">{story.readTime} read</span>
                        {story.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  <AnimatePresence>
                    {isExpanded ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="space-y-3 mb-4">
                          {story.paragraphs.map((p, j) => (
                            <p key={j} className="text-sm leading-relaxed text-[var(--muted)]">
                              {p}
                            </p>
                          ))}
                        </div>
                        <div className="bg-pink/10 rounded-2xl p-4 flex items-start gap-3 mb-4">
                          <Heart size={18} className="text-pink shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-pink mb-1">Moral</p>
                            <p className="text-sm">{story.moral}</p>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <p className="text-sm text-[var(--muted)] line-clamp-2">{story.paragraphs[0]}</p>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-3 border-t border-[var(--border-color)] gap-3 sm:gap-0">
                    <button
                      onClick={() => handleExpand(story)}
                      className="text-sm font-bold text-primary hover:text-primary-dark transition-colors touch-target"
                    >
                      {isExpanded ? "Show Less" : "Read More →"}
                    </button>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      
                      {/* Language Selection Read Buttons */}
                      <div className="flex items-center bg-[var(--surface-alt)] rounded-xl p-1 gap-1 border border-[var(--border-color)] shadow-sm">
                        <button
                          onClick={() => speakStory(story, 'en-US')}
                          disabled={translating && speaking === story.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors touch-target ${
                            speaking === story.id && speakingLang === 'en-US' ? "bg-primary text-white" : "hover:bg-primary/10 text-primary"
                          }`}
                        >
                          {speaking === story.id && speakingLang === 'en-US' ? <VolumeX size={14} /> : <Volume2 size={14} />} EN
                        </button>
                        <button
                          onClick={() => speakStory(story, 'hi-IN')}
                          disabled={translating && speaking === story.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors touch-target ${
                            speaking === story.id && speakingLang === 'hi-IN' ? "bg-orange text-white" : "hover:bg-orange/10 text-orange"
                          }`}
                        >
                          {translating && speaking === story.id && speakingLang === 'hi-IN' ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : speaking === story.id && speakingLang === 'hi-IN' ? (
                            <VolumeX size={14} />
                          ) : (
                            <Volume2 size={14} />
                          )} HI
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          toggleBookmark(`story-${story.id}`);
                          playSound("click");
                        }}
                        className={`p-2.5 rounded-xl border border-[var(--border-color)] transition-colors shadow-sm touch-target ${
                          isBookmarked ? "bg-accent text-white border-accent" : "bg-[var(--surface-alt)] hover:bg-accent/10 text-accent"
                        }`}
                        title="Bookmark Story"
                      >
                        {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
