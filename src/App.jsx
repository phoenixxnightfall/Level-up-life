import { useState, useEffect, useRef, useCallback } from "react";

// ─── STORAGE ───────────────────────────────────────────────────────────────
const STORAGE_KEY = "lul_v2";
const save = (data) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e){} };
const load = () => { try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch(e){ return null; } };

// ─── CONSTANTS ─────────────────────────────────────────────────────────────
const DEFAULT_SKILLS = [
  { id: "focus",       name: "Focus",       icon: "🧠", color: "#7DF9FF", xp: 0 },
  { id: "discipline",  name: "Discipline",  icon: "💪", color: "#FF6B6B", xp: 0 },
  { id: "learning",    name: "Learning",    icon: "📚", color: "#FFD93D", xp: 0 },
  { id: "mindfulness", name: "Mindfulness", icon: "🧘", color: "#6BCB77", xp: 0 },
  { id: "social",      name: "Social",      icon: "🗣", color: "#FF922B", xp: 0 },
];

const ICON_OPTIONS = ["🧠","💪","📚","🧘","🗣","⚡","🎯","🏃","🎨","🔬","💡","🎵","🌱","🔥","🧪","🏋","🎭","🌍","💻","🤝"];
const COLOR_OPTIONS = ["#7DF9FF","#FF6B6B","#FFD93D","#6BCB77","#FF922B","#C77DFF","#FF61D2","#00F5A0","#F7971E","#56CCF2"];

const TITLES = [
  { xp: 0,    label: "Unranked",         color: "#555" },
  { xp: 50,   label: "Rising Soul",      color: "#6BCB77" },
  { xp: 200,  label: "Seeker",           color: "#7DF9FF" },
  { xp: 500,  label: "Forge Apprentice", color: "#FFD93D" },
  { xp: 1000, label: "Growth Warrior",   color: "#FF922B" },
  { xp: 2000, label: "Ascendant",        color: "#FF6B6B" },
  { xp: 4000, label: "Legendary Mind",   color: "#C77DFF" },
];

const QUOTES = [
  "Every rep counts. Every page counts. Every day counts.",
  "The version of you 1 year from now is watching.",
  "Small disciplines, compounded daily, change everything.",
  "You are not behind. You are exactly where you need to be.",
  "Level up in life, not just in games.",
  "Discipline is freedom in disguise.",
  "Winners are just losers who tried one more time.",
];

const DIFF_XP = { Easy: 25, Medium: 75, Hard: 200 };
const DIFF_COLORS = { Easy: "#6BCB77", Medium: "#FFD93D", Hard: "#FF6B6B" };
const XP_FOR_LEVEL = (l) => Math.max(1, l) * 100;

const getLevelInfo = (totalXP) => {
  if (totalXP <= 0) return { level: 0, currentXP: 0, neededXP: 100, pct: 0 };
  let level = 0, used = 0;
  while (used + XP_FOR_LEVEL(level + 1) <= totalXP) {
    used += XP_FOR_LEVEL(level + 1);
    level++;
  }
  const currentXP = totalXP - used;
  const neededXP = XP_FOR_LEVEL(level + 1);
  return { level, currentXP, neededXP, pct: Math.min((currentXP / neededXP) * 100, 100) };
};

const getTitle = (xp) => TITLES.reduce((a, t) => xp >= t.xp ? t : a, TITLES[0]);

const DEFAULT_STATE = () => ({
  playerName: "Player",
  totalXP: 0,
  coins: 0,
  skills: DEFAULT_SKILLS,
  tasks: [],
  lastReset: new Date().toDateString(),
  seenTrailer: false,
});

// ─── TRAILER ───────────────────────────────────────────────────────────────
const TRAILER_SLIDES = [
  {
    icon: "⚔️",
    title: "YOUR LIFE IS THE GAME",
    sub: "Most people play video games to level up fictional characters.",
    accent: "#7DF9FF",
    particles: ["XP", "+50", "LVL UP", "★"],
  },
  {
    icon: "🎯",
    title: "WHAT IF YOU LEVELED UP YOURSELF?",
    sub: "Every habit, every study session, every workout — earns you real XP.",
    accent: "#FFD93D",
    particles: ["📚", "💪", "🧘", "⚡"],
  },
  {
    icon: "📈",
    title: "BUILD YOUR SKILL TREE",
    sub: "Customize your skills. Track what matters to YOU. No two players are the same.",
    accent: "#C77DFF",
    particles: ["Focus", "Discipline", "Learning", "Growth"],
  },
  {
    icon: "🔥",
    title: "STREAK. REWARD. REPEAT.",
    sub: "Chains of consistency create unstoppable momentum. Break the chain — lose the streak.",
    accent: "#FF6B6B",
    particles: ["🔥x7", "🏆", "+BONUS", "🪙"],
  },
  {
    icon: "🚀",
    title: "YOUR JOURNEY STARTS NOW",
    sub: "Level 0. No gear. No titles. Just potential waiting to be unlocked.",
    accent: "#6BCB77",
    particles: ["LV 0→∞", "START", "BEGIN", "GO"],
  },
];

function Trailer({ onFinish }) {
  const [slide, setSlide] = useState(0);
  const [phase, setPhase] = useState("in"); // in | hold | out
  const [particles, setParticles] = useState([]);
  const timerRef = useRef();

  const current = TRAILER_SLIDES[slide];

  useEffect(() => {
    setPhase("in");
    const pts = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      text: current.particles[i % current.particles.length],
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      delay: Math.random() * 2,
      dur: 3 + Math.random() * 2,
    }));
    setParticles(pts);

    timerRef.current = setTimeout(() => setPhase("out"), 3200);
    return () => clearTimeout(timerRef.current);
  }, [slide]);

  useEffect(() => {
    if (phase === "out") {
      timerRef.current = setTimeout(() => {
        if (slide < TRAILER_SLIDES.length - 1) setSlide(s => s + 1);
        else onFinish();
      }, 600);
    }
    return () => clearTimeout(timerRef.current);
  }, [phase]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#050510",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @keyframes trailerIn { from { opacity:0; transform:translateY(40px) scale(0.92); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes trailerOut { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateY(-30px) scale(1.04); } }
        @keyframes floatPt { 0%{opacity:0;transform:translateY(0)} 20%{opacity:0.7} 80%{opacity:0.4} 100%{opacity:0;transform:translateY(-120px)} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes bgPulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        @keyframes iconBounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
      `}</style>

      {/* Scanline effect */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px)",
        zIndex:2,
      }}/>
      <div style={{
        position:"absolute", left:0, right:0, height:60,
        background:"rgba(255,255,255,0.03)",
        animation:"scanline 3s linear infinite", zIndex:3, pointerEvents:"none",
      }}/>

      {/* Glow bg */}
      <div style={{
        position:"absolute", inset:0,
        background:`radial-gradient(ellipse 60% 50% at 50% 50%, ${current.accent}18, transparent 70%)`,
        animation:"bgPulse 3s ease infinite", transition:"background 0.6s",
      }}/>

      {/* Grid */}
      <div style={{
        position:"absolute", inset:0, opacity:0.06,
        backgroundImage:`linear-gradient(${current.accent} 1px,transparent 1px),linear-gradient(90deg,${current.accent} 1px,transparent 1px)`,
        backgroundSize:"40px 40px",
      }}/>

      {/* Floating particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position:"absolute", left:`${p.x}%`, top:`${p.y}%`,
          color: current.accent, fontFamily:"'Space Mono',monospace",
          fontSize:11, opacity:0, letterSpacing:1,
          animation:`floatPt ${p.dur}s ${p.delay}s ease-in-out infinite`,
          textShadow:`0 0 10px ${current.accent}`,
          zIndex:1, pointerEvents:"none",
        }}>{p.text}</div>
      ))}

      {/* Main content */}
      <div style={{
        position:"relative", zIndex:4, textAlign:"center", padding:"0 32px", maxWidth:440,
        animation: phase==="in" ? "trailerIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards"
                 : phase==="out" ? "trailerOut 0.5s ease-in forwards" : "none",
      }}>
        <div style={{
          fontSize:72, marginBottom:24, lineHeight:1,
          animation:"iconBounce 2s ease-in-out infinite",
          filter:`drop-shadow(0 0 30px ${current.accent})`,
        }}>{current.icon}</div>

        <div style={{
          color: current.accent, fontFamily:"'Space Mono',monospace",
          fontSize:9, letterSpacing:5, marginBottom:16,
          textShadow:`0 0 20px ${current.accent}`,
        }}>LEVEL UP LIFE</div>

        <h1 style={{
          color:"#fff", fontFamily:"'Space Mono',monospace",
          fontSize: window.innerWidth < 400 ? 22 : 26,
          fontWeight:700, lineHeight:1.2, marginBottom:20,
          textShadow:"0 0 40px rgba(255,255,255,0.3)",
        }}>{current.title}</h1>

        <p style={{
          color:"#aaa", fontFamily:"'Space Mono',monospace",
          fontSize:12, lineHeight:1.8, marginBottom:32,
        }}>{current.sub}</p>

        {/* Slide dots */}
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:28 }}>
          {TRAILER_SLIDES.map((_,i) => (
            <div key={i} style={{
              width: i===slide ? 24 : 8, height:8, borderRadius:4,
              background: i===slide ? current.accent : "rgba(255,255,255,0.15)",
              transition:"all 0.4s ease",
              boxShadow: i===slide ? `0 0 10px ${current.accent}` : "none",
            }}/>
          ))}
        </div>

        {slide === TRAILER_SLIDES.length - 1 && (
          <button onClick={onFinish} style={{
            background:`linear-gradient(135deg,${current.accent},#C77DFF)`,
            border:"none", borderRadius:10, padding:"14px 40px",
            color:"#050510", fontFamily:"'Space Mono',monospace",
            fontSize:13, fontWeight:700, cursor:"pointer",
            boxShadow:`0 0 40px ${current.accent}55`,
            letterSpacing:2,
          }}>BEGIN YOUR JOURNEY →</button>
        )}
        {slide < TRAILER_SLIDES.length - 1 && (
          <button onClick={() => setPhase("out")} style={{
            background:"rgba(255,255,255,0.06)", border:`1px solid ${current.accent}44`,
            borderRadius:8, padding:"10px 24px",
            color:"#888", fontFamily:"'Space Mono',monospace",
            fontSize:11, cursor:"pointer",
          }}>SKIP →</button>
        )}
      </div>
    </div>
  );
}

// ─── SMALL COMPONENTS ──────────────────────────────────────────────────────
const XPBar = ({ pct, color="#7DF9FF" }) => (
  <div style={{ height:10, background:"rgba(255,255,255,0.07)", borderRadius:5, overflow:"hidden" }}>
    <div style={{
      height:"100%", width:`${pct}%`,
      background:`linear-gradient(90deg,${color},#C77DFF)`,
      borderRadius:5, transition:"width 0.9s cubic-bezier(0.34,1.56,0.64,1)",
      boxShadow:`0 0 10px ${color}88`,
    }}/>
  </div>
);

function SkillCustomizer({ skills, onChange }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [adding, setAdding] = useState(false);
  const [newSkill, setNewSkill] = useState({ name:"", icon:"🎯", color:COLOR_OPTIONS[0] });

  const startEdit = (sk) => { setEditing(sk.id); setForm({ name:sk.name, icon:sk.icon, color:sk.color }); };

  const saveEdit = () => {
    onChange(skills.map(s => s.id===editing ? { ...s, ...form } : s));
    setEditing(null);
  };

  const deleteSkill = (id) => {
    if (skills.length <= 1) return;
    onChange(skills.filter(s => s.id !== id));
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    onChange([...skills, { id: Date.now().toString(), xp:0, ...newSkill }]);
    setNewSkill({ name:"", icon:"🎯", color:COLOR_OPTIONS[0] });
    setAdding(false);
  };

  const inputStyle = {
    width:"100%", background:"rgba(255,255,255,0.05)",
    border:"1px solid rgba(255,255,255,0.1)", borderRadius:7,
    padding:"9px 11px", color:"#fff",
    fontFamily:"'Space Mono',monospace", fontSize:12,
    outline:"none", boxSizing:"border-box",
  };

  return (
    <div>
      <div style={{ color:"#555", fontSize:10, letterSpacing:2, marginBottom:14 }}>CUSTOMIZE SKILL TREE</div>
      {skills.map(sk => (
        <div key={sk.id} style={{
          background:"rgba(255,255,255,0.03)", border:`1px solid ${sk.color}22`,
          borderLeft:`3px solid ${sk.color}`, borderRadius:10,
          padding:"12px 14px", marginBottom:8,
        }}>
          {editing === sk.id ? (
            <div>
              <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                  style={{...inputStyle,flex:1}} placeholder="Skill name"/>
              </div>
              <div style={{ marginBottom:8 }}>
                <div style={{ color:"#555", fontSize:9, letterSpacing:2, marginBottom:5 }}>ICON</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {ICON_OPTIONS.map(ic => (
                    <button key={ic} onClick={()=>setForm(p=>({...p,icon:ic}))} style={{
                      width:30, height:30, fontSize:16, borderRadius:6, cursor:"pointer",
                      background: form.icon===ic ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)",
                      border: form.icon===ic ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent",
                    }}>{ic}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:10 }}>
                <div style={{ color:"#555", fontSize:9, letterSpacing:2, marginBottom:5 }}>COLOR</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {COLOR_OPTIONS.map(c => (
                    <button key={c} onClick={()=>setForm(p=>({...p,color:c}))} style={{
                      width:24, height:24, borderRadius:"50%", cursor:"pointer",
                      background:c, border: form.color===c ? "2px solid #fff" : "2px solid transparent",
                    }}/>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setEditing(null)} style={{
                  flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
                  borderRadius:7, padding:"8px", color:"#666", fontFamily:"'Space Mono',monospace",
                  fontSize:10, cursor:"pointer",
                }}>CANCEL</button>
                <button onClick={saveEdit} style={{
                  flex:2, background:`${form.color}22`, border:`1px solid ${form.color}55`,
                  borderRadius:7, padding:"8px", color:form.color, fontFamily:"'Space Mono',monospace",
                  fontSize:10, cursor:"pointer",
                }}>SAVE ✓</button>
              </div>
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:20 }}>{sk.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ color:"#ddd", fontFamily:"'Space Mono',monospace", fontSize:13 }}>{sk.name}</div>
                <div style={{ color:"#555", fontFamily:"'Space Mono',monospace", fontSize:10 }}>{sk.xp} XP</div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={()=>startEdit(sk)} style={{
                  background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
                  borderRadius:6, padding:"5px 9px", color:"#888", cursor:"pointer", fontSize:11,
                }}>✎</button>
                <button onClick={()=>deleteSkill(sk.id)} style={{
                  background:"rgba(255,80,80,0.06)", border:"1px solid rgba(255,80,80,0.15)",
                  borderRadius:6, padding:"5px 9px", color:"#FF6B6B", cursor:"pointer", fontSize:11,
                }}>×</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <div style={{
          background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:10, padding:"14px",
        }}>
          <input value={newSkill.name} onChange={e=>setNewSkill(p=>({...p,name:e.target.value}))}
            style={inputStyle} placeholder="New skill name..." />
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, margin:"10px 0 6px" }}>
            {ICON_OPTIONS.map(ic => (
              <button key={ic} onClick={()=>setNewSkill(p=>({...p,icon:ic}))} style={{
                width:28,height:28,fontSize:15,borderRadius:5,cursor:"pointer",
                background:newSkill.icon===ic?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.04)",
                border:newSkill.icon===ic?"1px solid rgba(255,255,255,0.3)":"1px solid transparent",
              }}>{ic}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:5, marginBottom:10 }}>
            {COLOR_OPTIONS.map(c=>(
              <button key={c} onClick={()=>setNewSkill(p=>({...p,color:c}))} style={{
                width:22,height:22,borderRadius:"50%",cursor:"pointer",
                background:c,border:newSkill.color===c?"2px solid #fff":"2px solid transparent",
              }}/>
            ))}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setAdding(false)} style={{
              flex:1,background:"rgba(255,255,255,0.04)",border:"none",borderRadius:7,
              padding:"8px",color:"#666",fontFamily:"'Space Mono',monospace",fontSize:10,cursor:"pointer",
            }}>CANCEL</button>
            <button onClick={addSkill} style={{
              flex:2,background:`${newSkill.color}22`,border:`1px solid ${newSkill.color}55`,
              borderRadius:7,padding:"8px",color:newSkill.color,
              fontFamily:"'Space Mono',monospace",fontSize:10,cursor:"pointer",
            }}>ADD SKILL ✓</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setAdding(true)} style={{
          width:"100%", background:"rgba(255,255,255,0.03)",
          border:"1px dashed rgba(255,255,255,0.12)", borderRadius:10,
          padding:"12px", color:"#555", fontFamily:"'Space Mono',monospace",
          fontSize:11, cursor:"pointer",
        }}>+ ADD NEW SKILL</button>
      )}
    </div>
  );
}

// ─── AI COACH ───────────────────────────────────────────────���──────────────
function AICoach({ playerData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef();

  const { level } = getLevelInfo(playerData.totalXP);

  const systemPrompt = `You are an AI life coach inside a self-growth RPG app called "Level Up Life".
The player is: Level ${getLevelInfo(playerData.totalXP).level}, ${playerData.totalXP} total XP, ${playerData.coins} coins.
Their skills: ${playerData.skills.map(s=>`${s.name}(${s.xp}xp)`).join(", ")}.
Active tasks: ${playerData.tasks.filter(t=>!t.done).map(t=>t.title).join(", ") || "none"}.
Be motivating, concise, game-themed. Use XP/quest language. Max 3 sentences per reply. No asterisks for bold.`;

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 256,
          system: systemPrompt,
          messages: newMsgs,
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(c=>c.text||"").join("") || "Keep pushing, you got this!";
      setMessages([...newMsgs, { role: "assistant", content: reply }]);
    } catch(e) {
      setMessages([...newMsgs, { role: "assistant", content: "Connection issue. Keep grinding! 💪" }]);
    }
    setLoading(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "rgba(255,255,255,0.02)", borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{
        padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)",
        color: "#7DF9FF", fontFamily: "'Space Mono',monospace", fontSize: 13,
        letterSpacing: 1,
      }}>⚡ AI COACH</div>

      <div style={{
        flex: 1, overflowY: "auto", padding: "16px", display: "flex",
        flexDirection: "column", gap: 12,
      }}>
        {!started && messages.length === 0 && (
          <div style={{
            color: "#666", fontSize: 12, lineHeight: 1.6,
            fontFamily: "'Space Mono',monospace",
          }}>
            Chat with your AI coach. Ask for motivation, quest ideas, or strategy tips!
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            textAlign: m.role === "user" ? "right" : "left",
            color: m.role === "user" ? "#7DF9FF" : "#aaa",
            fontSize: 12, fontFamily: "'Space Mono',monospace", lineHeight: 1.5,
          }}>
            <div style={{
              display: "inline-block",
              background: m.role === "user" ? "rgba(125,249,255,0.1)" : "rgba(255,255,255,0.05)",
              padding: "8px 12px", borderRadius: 8,
              maxWidth: "70%",
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{
            color: "#555", fontSize: 11, fontFamily: "'Space Mono',monospace",
          }}>
            Coach is thinking...
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div style={{
        display: "flex", gap: 8, padding: 12,
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === "Enter" && send()}
          placeholder="Ask me anything..."
          style={{
            flex: 1, background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
            padding: "8px 10px", color: "#ddd", fontSize: 11,
            fontFamily: "'Space Mono',monospace", outline: "none",
          }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            background: loading ? "rgba(255,255,255,0.05)" : "rgba(125,249,255,0.2)",
            border: "1px solid rgba(125,249,255,0.3)", borderRadius: 6,
            padding: "8px 12px", color: "#7DF9FF", cursor: loading ? "default" : "pointer",
            fontFamily: "'Space Mono',monospace", fontSize: 11,
          }}
        >
          {loading ? "..." : "SEND"}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [playerData, setPlayerData] = useState(null);
  const [tab, setTab] = useState("dashboard"); // dashboard | skills | tasks | settings
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", difficulty: "Medium" });

  useEffect(() => {
    const saved = load();
    if (saved) setPlayerData(saved);
    else setPlayerData(DEFAULT_STATE());
  }, []);

  useEffect(() => {
    if (playerData) save(playerData);
  }, [playerData]);

  if (!playerData) return <div style={{background:"#050510",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:"#7DF9FF",fontFamily:"'Space Mono',monospace"}}>INITIALIZING...</div></div>;

  const { level, currentXP, neededXP, pct } = getLevelInfo(playerData.totalXP);
  const titleInfo = getTitle(playerData.totalXP);

  const addTask = () => {
    if (!taskForm.title.trim()) return;
    const xp = DIFF_XP[taskForm.difficulty] || 50;
    setPlayerData(p => ({
      ...p,
      tasks: [...p.tasks, {
        id: Date.now().toString(),
        title: taskForm.title,
        difficulty: taskForm.difficulty,
        xp,
        done: false,
        createdAt: new Date().toISOString(),
      }],
    }));
    setTaskForm({ title: "", difficulty: "Medium" });
    setShowTaskForm(false);
  };

  const completeTask = (id) => {
    setPlayerData(p => {
      const task = p.tasks.find(t => t.id === id);
      if (!task) return p;
      return {
        ...p,
        tasks: p.tasks.map(t => t.id === id ? { ...t, done: true } : t),
        totalXP: p.totalXP + task.xp,
        skills: p.skills.map(s => Math.random() < 0.3 ? { ...s, xp: s.xp + task.xp / 2 } : s),
      };
    });
  };

  const deleteTask = (id) => {
    setPlayerData(p => ({
      ...p,
      tasks: p.tasks.filter(t => t.id !== id),
    }));
  };

  const updateSkills = (newSkills) => {
    setPlayerData(p => ({ ...p, skills: newSkills }));
  };

  const updatePlayerName = (name) => {
    setPlayerData(p => ({ ...p, playerName: name }));
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #050510 0%, #0a0a15 100%)",
      color: "#ddd",
      fontFamily: "'Space Mono',monospace",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes slideIn { from { transform:translateX(-20px); opacity:0 } to { transform:translateX(0); opacity:1 } }
        * { margin:0; padding:0; box-sizing:border-box }
        html, body { width:100%; height:100% }
        #root { width:100%; height:100% }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance:none; margin:0 }
        input[type=number] { -moz-appearance:textfield }
      `}</style>

      {/* HEADER */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <h1 style={{
            fontSize: 16, fontWeight: 700, letterSpacing: 2,
            background: "linear-gradient(90deg,#7DF9FF,#C77DFF)", WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent", marginBottom: 4,
          }}>LEVEL UP LIFE</h1>
          <div style={{ fontSize: 10, color: "#666", letterSpacing: 1 }}>
            {titleInfo.label.toUpperCase()} • LV {level}
          </div>
        </div>
        <div style={{
          display: "flex", gap: 16, alignItems: "center",
        }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#7DF9FF" }}>{playerData.totalXP} XP</div>
            <div style={{ fontSize: 11, color: "#666" }}>{playerData.coins} 🪙</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20,
        padding: 20, maxWidth: 1400, margin: "0 auto",
        minHeight: "calc(100vh - 140px)",
      }}>
        {/* LEFT: Dashboard */}
        <div>
          <div style={{ marginBottom: 24 }}>
            <div style={{
              color: "#555", fontSize: 9, letterSpacing: 2,
              marginBottom: 12,
            }}>PROGRESS</div>
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <input
                  value={playerData.playerName}
                  onChange={e => updatePlayerName(e.target.value)}
                  style={{
                    flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 6, padding: "8px 10px", color: "#fff", fontSize: 13,
                    fontFamily: "'Space Mono',monospace", outline: "none",
                  }}
                />
              </div>
              <div style={{ color: "#888", fontSize: 10, marginBottom: 8 }}>
                Level {level}: {currentXP} / {neededXP} XP
              </div>
              <XPBar pct={pct} color={titleInfo.color} />
            </div>
          </div>

          {/* TASKS */}
          <div>
            <div style={{
              color: "#555", fontSize: 9, letterSpacing: 2,
              marginBottom: 12, display: "flex", justifyContent: "space-between",
            }}>
              <span>QUESTS</span>
              <span>{playerData.tasks.filter(t => !t.done).length} active</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {playerData.tasks.map(t => (
                <div key={t.id} style={{
                  background: t.done ? "rgba(107,203,119,0.08)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${t.done ? "rgba(107,203,119,0.15)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 8, padding: 12,
                  opacity: t.done ? 0.6 : 1,
                  transition: "all 0.3s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      onClick={() => completeTask(t.id)}
                      disabled={t.done}
                      style={{
                        width: 20, height: 20, borderRadius: 4,
                        background: t.done ? "rgba(107,203,119,0.3)" : DIFF_COLORS[t.difficulty],
                        border: "none", cursor: t.done ? "default" : "pointer",
                        color: "#050510", fontSize: 12, fontWeight: 700,
                      }}
                    >
                      {t.done ? "✓" : ""}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: "#ddd", fontSize: 12,
                        textDecoration: t.done ? "line-through" : "none",
                      }}>
                        {t.title}
                      </div>
                      <div style={{
                        fontSize: 10, color: "#666",
                      }}>
                        {t.difficulty} • +{t.xp} XP
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(t.id)}
                      style={{
                        background: "transparent", border: "none",
                        color: "#FF6B6B", cursor: "pointer", fontSize: 14,
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {showTaskForm ? (
              <div style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, padding: 12, marginTop: 12,
              }}>
                <input
                  value={taskForm.title}
                  onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Quest title..."
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
                    padding: "8px 10px", color: "#fff", fontSize: 11,
                    fontFamily: "'Space Mono',monospace", outline: "none",
                    marginBottom: 8,
                  }}
                />
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  {Object.keys(DIFF_XP).map(d => (
                    <button
                      key={d}
                      onClick={() => setTaskForm(f => ({ ...f, difficulty: d }))}
                      style={{
                        flex: 1, padding: "6px", background: taskForm.difficulty === d ? DIFF_COLORS[d] + "33" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${taskForm.difficulty === d ? DIFF_COLORS[d] : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 5, color: "#888", fontSize: 10, cursor: "pointer",
                        fontFamily: "'Space Mono',monospace",
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setShowTaskForm(false)}
                    style={{
                      flex: 1, background: "rgba(255,255,255,0.03)", border: "none",
                      borderRadius: 5, padding: "6px", color: "#666", cursor: "pointer",
                      fontSize: 10, fontFamily: "'Space Mono',monospace",
                    }}
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={addTask}
                    style={{
                      flex: 2, background: "rgba(125,249,255,0.2)", border: "1px solid rgba(125,249,255,0.3)",
                      borderRadius: 5, padding: "6px", color: "#7DF9FF", cursor: "pointer",
                      fontSize: 10, fontFamily: "'Space Mono',monospace",
                    }}
                  >
                    CREATE ✓
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowTaskForm(true)}
                style={{
                  width: "100%", marginTop: 12, background: "rgba(255,255,255,0.03)",
                  border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 8,
                  padding: 12, color: "#555", cursor: "pointer", fontSize: 11,
                  fontFamily: "'Space Mono',monospace",
                }}
              >
                + NEW QUEST
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Skills & Coach */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* SKILLS */}
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: 16,
          }}>
            <SkillCustomizer skills={playerData.skills} onChange={updateSkills} />
          </div>

          {/* AI COACH */}
          <div style={{ flex: 1, minHeight: 300 }}>
            <AICoach playerData={playerData} />
          </div>
        </div>
      </div>
    </div>
  );
}
