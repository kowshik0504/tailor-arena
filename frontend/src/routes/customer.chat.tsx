import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Send, Paperclip, Image as ImageIcon, Check, CheckCheck, Circle, Sparkles, Bot, User
} from "lucide-react";

export const Route = createFileRoute("/customer/chat")({ component: CustomerChat });

type Thread = {
  id: string;
  name: string;
  tailorName?: string;
  customerName?: string;
  shop: string;
  initial: string;
  tint: string;
  last: string;
  unread: number;
  online: boolean;
  time: string;
};

type Msg = {
  id: string;
  from: "me" | "them";
  text?: string;
  image?: string;
  time: string;
  read?: boolean;
  system?: boolean;
  isAi?: boolean;
  requiresAction?: "escalate_confirm" | "booking_link";
};

const initialThreads: Thread[] = [
  { id: "t1", name: "Maison Aarav", shop: "Bandra, Mumbai", initial: "MA", tint: "bg-gradient-gold", last: "Pricing would be ₹18,000 including thread & lining.", unread: 1, online: true, time: "2m" },
  { id: "t2", name: "Studio Kavya", shop: "Hauz Khas, Delhi", initial: "SK", tint: "bg-gradient-rose", last: "Yes, we can stitch that lehenga design.", unread: 0, online: true, time: "1h" },
  { id: "t3", name: "Atelier Dev", shop: "Indiranagar, Blr", initial: "AD", tint: "bg-gradient-luxe text-primary-foreground", last: "Sample work attached for your review.", unread: 0, online: false, time: "Yesterday" },
];

const initialConversation: Record<string, Msg[]> = {
  t1: [
    { id: "1", from: "me", text: "Hi! I have a bridal lehenga design I'd like stitched.", time: "10:24", read: true },
    { id: "2", from: "them", text: "Of course. Could you share a reference image and the fabric details?", time: "10:26" },
    { id: "3", from: "me", image: "ref", text: "Here's the inspiration", time: "10:31", read: true },
    { id: "4", from: "me", text: "And the fabric I picked — silk crepe in maroon.", time: "10:32", read: true },
    { id: "5", from: "them", text: "Beautiful choice. The design is fully feasible. Estimated 18–22 days.", time: "10:40" },
    { id: "6", from: "them", text: "Pricing would be ₹18,000 including thread & lining.", time: "10:41" },
  ],
};

function CustomerChat() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [conversation, setConversation] = useState<Record<string, Msg[]>>({});
  const [aiModes, setAiModes] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>("");
  const [draft, setDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get('/bookings/customer');
        const data = res.data || [];
        
        const newThreads: Thread[] = [];
        const newConv: Record<string, Msg[]> = {};
        
        data.forEach((o: any) => {
          const tId = o._id;
          newThreads.push({
            id: tId,
            name: o.tailor?.user?.name || "Tailor",
            shop: o.tailor?.businessName || "Tailor Shop",
            initial: (o.tailor?.businessName || o.tailor?.user?.name || "T").substring(0, 1).toUpperCase(),
            tint: "bg-gradient-gold text-navy-deep",
            last: o.chat && o.chat.length > 0 ? o.chat[o.chat.length - 1].text : "Order started",
            unread: 0,
            online: false,
            time: o.chat && o.chat.length > 0 ? o.chat[o.chat.length - 1].time : ""
          });
          
          if (o.chat && o.chat.length > 0) {
            newConv[tId] = o.chat.map((msg: any) => ({
              id: msg._id || Math.random().toString(),
              from: msg.from === 'customer' ? 'me' : 'them',
              text: msg.text,
              image: msg.image,
              time: msg.time,
              read: true
            }));
          } else {
            newConv[tId] = [];
          }
        });
        
        setThreads(newThreads);
        setConversation(newConv);
      } catch (err) {
        console.error("Failed to fetch chats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (!active && threads.length > 0) {
      setActive(threads[0].id);
    }
  }, [threads, active]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tailorId = params.get("tailorId");
    const tailorName = params.get("name");

    if (tailorId && tailorName) {
      setActive(tailorId);
      
      const initials = tailorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || "T";
      const isOnline = Math.random() > 0.5;
      
      const newThread: Thread = {
        id: tailorId,
        name: tailorName, // Legacy
        tailorName: tailorName,
        customerName: "Current Customer", // This represents the logged in customer
        shop: "Premium Atelier",
        initial: initials,
        tint: "bg-gradient-gold",
        last: "Tap to message",
        unread: 0,
        online: isOnline,
        time: "Just now"
      };

      setThreads(prev => {
        if (prev.find(t => t.id === tailorId)) return prev;
        return [newThread, ...prev];
      });
      
      setConversation(prev => {
        if (prev[tailorId]) return prev;
        return { ...prev, [tailorId]: [] };
      });

      setAiModes(prev => {
        if (prev[tailorId] !== undefined) return prev;
        return { ...prev, [tailorId]: true }; 
      });
    }
  }, []);

  const msgs = conversation[active] ?? [];
  const thread = threads.find((t) => t.id === active) || threads[0];
  const isAiActive = aiModes[active] !== false;
  const [isTyping, setIsTyping] = useState(false);

  const analyzeWithAI = async (text: string, tailorName: string, chatHistory: Msg[]): Promise<string> => {
    try {
     const apiKey = import.meta.env.VITE_GCP_API_KEY;
      const systemInstruction = `You are a polite, highly capable AI assistant for a tailor shop named "${tailorName}".
Your job is to answer questions strictly related to tailoring, fabrics, measurements, pricing, and bookings.
Be extremely polite and helpful. Greet the customer warmly. Read the entire conversation context to understand what they need.
The AI must never create a booking automatically. The AI may only:
- Answer customer questions
- Recommend tailoring services
- Provide estimated pricing
- Explain measurement requirements
- Help choose suitable appointment dates
- Suggest dress styles and fabrics

The booking must only be created after the customer explicitly clicks "Book Appointment" and submits the booking form.
If the customer mentions booking at any point, politely guide them to the booking page or if they insist, reply with exactly the word "BOOKING_LINK" and nothing else.
If the customer asks about irrelevant topics, politely decline and steer them back to tailoring.
If the customer asks to speak with a human tailor, FIRST try to answer their underlying question or solve their problem. Do NOT escalate immediately.
If they ask a SECOND time, or if they are extremely frustrated and explicitly demand a human again after you've tried to help, reply with exactly the word "ESCALATE" and nothing else.`;

      // Build Gemini history
      const formattedHistory = chatHistory.filter(m => m.text && !m.system).map(m => ({
        role: m.from === "me" ? "user" : "model",
        parts: [{ text: m.text }]
      }));

      const payload = {
        system_instruction: { parts: { text: systemInstruction } },
        contents: [...formattedHistory, { role: "user", parts: [{ text }] }],
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error("AI API Error:", response.statusText);
        return fallbackAnalyze(text);
      }

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || fallbackAnalyze(text);
      return aiText.trim();
    } catch (err) {
      console.error("AI Fetch Error", err);
      return fallbackAnalyze(text);
    }
  };

  const fallbackAnalyze = (text: string): string => {
    const lower = text.toLowerCase();
    const badWordsRegex = /\b(damn|hell|fuck|shit|bitch|crap|idiot|stupid)\b/i;
    if (badWordsRegex.test(lower)) {
      return "Please maintain a professional tone. I am an automated assistant for this atelier.";
    }
    const offTopic = ["weather", "politics", "movie", "sports", "game", "restaurant", "flight", "music"];
    if (offTopic.some(ot => lower.includes(ot))) {
      return "I'm sorry, but I am a tailoring assistant. I can only assist you with questions related to clothing design.";
    }
    if (lower.includes("human") || lower.includes("tailor") || lower.includes("person") || lower.includes("escalate")) {
      return "ESCALATE";
    }
    return "I am currently running in fallback mode as my API key was invalid. Let me transfer you directly to the tailor.";
  };

  const handleEscalate = () => {
    setAiModes(prev => ({ ...prev, [active]: false }));
    const systemMsg: Msg = {
      id: Date.now().toString(),
      from: "them",
      system: true,
      text: `Chat escalated to human tailor. The tailor has been notified and will respond shortly.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setConversation(prev => ({
      ...prev,
      [active]: [...(prev[active] || []), systemMsg]
    }));
  };

  const handleSend = async () => {
    if (!draft.trim()) return;
    const newMsg: Msg = {
      id: Date.now().toString(),
      from: "me",
      text: draft,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setConversation(prev => ({
      ...prev,
      [active]: [...(prev[active] || []), newMsg]
    }));
    const userText = draft;
    setDraft("");
    
    if (isAiActive) {
      setIsTyping(true);
      const aiResponse = await analyzeWithAI(userText, thread.name, msgs);
      setIsTyping(false);
      
      if (aiResponse === "BOOKING_LINK") {
        const linkMsg: Msg = {
          id: Date.now().toString(),
          from: "them",
          text: "I can help you set that up. Please click the button below to fill out your booking details and confirm your appointment.",
          isAi: true,
          requiresAction: "booking_link",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setConversation(prev => ({ ...prev, [active]: [...(prev[active] || []), linkMsg] }));
      } else if (aiResponse === "ESCALATE" || aiResponse.includes("transfer you directly")) {
        const confirmMsg: Msg = {
          id: Date.now().toString(),
          from: "them",
          text: "It looks like you want to speak with a human tailor. Did I resolve your issue, or would you still like me to transfer you?",
          isAi: true,
          requiresAction: "escalate_confirm",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setConversation(prev => ({ ...prev, [active]: [...(prev[active] || []), confirmMsg] }));
      } else {
        const reply: Msg = {
          id: Date.now().toString(),
          from: "them",
          text: aiResponse,
          isAi: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setConversation(prev => ({ ...prev, [active]: [...(prev[active] || []), reply] }));
      }
      // When AI is off, we do nothing automatically. The real human tailor will reply via chat.tsx.
    }
  };

  const handleActionClick = (msgId: string, action: "continue_ai" | "escalate" | "book_now") => {
    if (action === "book_now") {
      window.location.href = `/customer/book/${active}`;
      return;
    }

    setConversation(prev => {
      const msgs = prev[active] || [];
      const updated = msgs.map(m => {
        if (m.id === msgId) {
          return {
            ...m,
            requiresAction: undefined,
            text: action === "continue_ai" 
              ? "I'm glad I could help! Let me know if you need anything else." 
              : "Transferring you to the tailor..."
          };
        }
        return m;
      });
      return { ...prev, [active]: updated };
    });

    if (action === "escalate") {
      setTimeout(handleEscalate, 500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        const newMsg: Msg = {
          id: Date.now().toString(),
          from: "me",
          image: base64String,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false
        };
        setConversation(prev => ({
          ...prev,
          [active]: [...(prev[active] || []), newMsg]
        }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  if (!thread) return null;

  return (
    <PageShell title="Chat" subtitle="Private conversations with your tailors — share designs, fabrics & references.">
      <Card className="border-gold/60 shadow-luxe overflow-hidden">
        <div className="grid md:grid-cols-[320px_1fr] min-h-[640px]">
          <div className="border-r border-gold/60 bg-gradient-soft flex flex-col">
            <div className="p-4 border-b border-gold/60">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tailors…" className="pl-9 bg-white/80 rounded-full h-10 border-gold/60" />
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {threads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gold/40 transition
                    ${active === t.id ? "bg-champagne/50" : "hover:bg-white/60"}`}
                >
                  <div className="relative">
                    <div className={`h-11 w-11 rounded-2xl ${t.tint} flex items-center justify-center font-display text-sm shadow-luxe`}>
                      {t.initial}
                    </div>
                    {t.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-cream" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-navy text-sm truncate">{t.tailorName || t.name}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{t.time}</span>
                    </div>
                    <p className="text-[10px] text-mocha/70">{t.shop}</p>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-mocha truncate">{t.last}</p>
                      {t.unread > 0 && (
                        <Badge className="rounded-full bg-gradient-gold text-navy-deep h-5 min-w-5 px-1.5 text-[10px]">{t.unread}</Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col bg-white/40">
            <div className="px-5 py-4 border-b border-gold/60 bg-white/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-2xl ${thread.tint} flex items-center justify-center font-display text-sm shadow-luxe`}>
                  {thread.initial}
                </div>
                <div>
                  <div className="font-display text-navy flex items-center gap-2">
                    {thread.tailorName || thread.name}
                    {isAiActive && <Badge className="h-5 text-[10px] bg-gradient-gold text-navy-deep px-1.5 gap-1"><Bot className="h-3 w-3" /> AI Assist</Badge>}
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    {thread.online ? (
                      <><Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" /> Online · {thread.shop}</>
                    ) : `Last seen recently · ${thread.shop}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="rounded-full text-[10px] border-gold/50 text-navy bg-gold/10 gap-1 h-8 px-3">
                  <Sparkles className="h-3 w-3" /> Design Consult
                </Badge>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-5 space-y-3">
              {msgs.length === 0 && (
                <div className="text-center text-mocha/50 text-sm mt-10">
                  {isAiActive ? "The AI Assistant is ready to help you!" : `Send a message to start chatting with ${thread.name}`}
                </div>
              )}
              {msgs.map((m) => (
                <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-luxe relative
                    ${m.system ? "bg-amber-100 text-amber-800 text-xs text-center border-none w-full shadow-none max-w-full my-4" : 
                      m.from === "me" ? "bg-gradient-navy text-cream rounded-br-md" : "bg-cream rounded-bl-md border border-gold/60"}`}>
                    {m.isAi && (
                      <div className="absolute -left-2 -top-2 bg-gradient-gold rounded-full p-1 shadow-sm">
                        <Bot className="h-3 w-3 text-navy-deep" />
                      </div>
                    )}
                    {m.image && (
                      <div className="mb-2 rounded-xl overflow-hidden bg-gradient-cream h-40 w-56 flex items-center justify-center text-navy relative border border-gold/40">
                        {m.image.startsWith('data:') ? (
                          <img src={m.image} alt="attachment" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-8 w-8 opacity-60" />
                        )}
                      </div>
                    )}
                    {m.text && <p className={m.system ? "text-xs font-medium" : "text-sm whitespace-pre-wrap"}>{m.text}</p>}
                    {!m.system && (
                      <div className={`flex items-center gap-1 mt-1 text-[10px] ${m.from === "me" ? "text-cream/70 justify-end" : "text-muted-foreground"}`}>
                        <span>{m.time}</span>
                        {m.from === "me" && (m.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                      </div>
                    )}
                    {m.requiresAction === "escalate_confirm" && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gold/30">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleActionClick(m.id, "continue_ai")}
                          className="flex-1 text-xs border-gold text-navy hover:bg-gold/10 gap-1.5"
                        >
                          👍 Yes, resolved
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleActionClick(m.id, "escalate")}
                          className="flex-1 text-xs border-gold text-rose-600 hover:bg-rose-50 gap-1.5"
                        >
                          👎 Talk to tailor
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-cream rounded-2xl rounded-bl-md border border-gold/60 px-4 py-3 shadow-luxe relative flex items-center gap-1">
                    <div className="absolute -left-2 -top-2 bg-gradient-gold rounded-full p-1 shadow-sm">
                      <Bot className="h-3 w-3 text-navy-deep" />
                    </div>
                    <span className="h-2 w-2 bg-mocha/40 rounded-full animate-bounce"></span>
                    <span className="h-2 w-2 bg-mocha/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="h-2 w-2 bg-mocha/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gold/60 bg-white/80 relative">
              {isAiActive && (
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className="rounded-full text-[10px] border-gold/60 cursor-pointer hover:bg-champagne/40" onClick={() => setDraft("Hello, how does this work?")}>
                    Hello
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-[10px] border-gold/60 cursor-pointer hover:bg-champagne/40" onClick={() => setDraft("What's the estimated cost for a dress?")}>
                    Estimated cost?
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-[10px] border-gold/60 cursor-pointer hover:bg-champagne/40" onClick={() => setDraft("What is the delivery timeline?")}>
                    Delivery timeline?
                  </Badge>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="rounded-full" title="Attach file" onClick={() => fileInputRef.current?.click()}><Paperclip className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="rounded-full" title="Send image" onClick={() => fileInputRef.current?.click()}><ImageIcon className="h-4 w-4" /></Button>
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isAiActive ? "Message AI assistant..." : "Message your tailor…"}
                  className="flex-1 rounded-full bg-cream border-gold/60 h-11"
                />
                <Button className="rounded-full bg-gradient-navy text-cream h-11 px-5 gap-2" onClick={handleSend}>
                  <Send className="h-4 w-4 text-cream" /> Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
