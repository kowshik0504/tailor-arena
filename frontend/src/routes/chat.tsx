import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Send, Paperclip, Image as ImageIcon, Check, CheckCheck, Circle, Bot
} from "lucide-react";

export const Route = createFileRoute("/chat")({ component: TailorChat });

type Thread = {
  id: string;
  name: string;
  tailorName?: string;
  customerName?: string;
  shop?: string;
  initial: string;
  tint: string;
  last: string;
  unread: number;
  online: boolean;
  time: string;
};

type Msg = {
  id: string;
  from: "me" | "them"; // "me" = Customer, "them" = Tailor
  text?: string;
  image?: string;
  time: string;
  read?: boolean;
  typing?: boolean;
  isAi?: boolean;
  system?: boolean;
};

import api from "@/lib/api";

function TailorChat() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [conversation, setConversation] = useState<Record<string, Msg[]>>({});
  const [aiModes, setAiModes] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get('/bookings/tailor');
        const data = res.data || [];
        
        const newThreads: Thread[] = [];
        const newConv: Record<string, Msg[]> = {};
        
        data.forEach((o: any) => {
          const tId = o._id;
          newThreads.push({
            id: tId,
            name: o.customer?.name || o.customer || "Customer",
            initial: (o.customer?.name || o.customer || "C").substring(0, 1).toUpperCase(),
            tint: "bg-navy text-cream",
            last: o.chat && o.chat.length > 0 ? o.chat[o.chat.length - 1].text : "Order started",
            unread: 0,
            online: false,
            time: o.chat && o.chat.length > 0 ? o.chat[o.chat.length - 1].time : ""
          });
          
          if (o.chat && o.chat.length > 0) {
            newConv[tId] = o.chat.map((msg: any) => ({
              id: msg._id || Math.random().toString(),
              from: msg.from === 'tailor' ? 'them' : 'me', // "them" in UI corresponds to tailor
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

  const [active, setActive] = useState<string>(threads.length > 0 ? threads[0].id : "");
  const [draft, setDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!active && threads.length > 0) {
      setActive(threads[0].id);
    }
  }, [threads, active]);

  const handleSend = async () => {
    if (!draft.trim() || !active) return;
    const newMsg: Msg = {
      id: Date.now().toString(),
      from: "them", // Tailor is "them" in this data model
      text: draft,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setConversation(prev => ({
      ...prev,
      [active]: [...(prev[active] || []), newMsg]
    }));
    setDraft("");
    
    // In a real implementation, send message to backend endpoint
    // await api.put(`/bookings/${active}/chat`, { from: 'tailor', text: draft, time: newMsg.time });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        const newMsg: Msg = {
          id: Date.now().toString(),
          from: "them", // Tailor is "them"
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

  const msgs = active ? (conversation[active] ?? []) : [];
  const thread = threads.find((t) => t.id === active);

  return (
    <PageShell title="Messages" subtitle="Private conversations with your customers.">
      <Card className="border-gold/60 shadow-luxe overflow-hidden">
        <div className="grid md:grid-cols-[320px_1fr] min-h-[640px]">
          {/* Threads list */}
          <div className="border-r border-gold/60 bg-gradient-soft flex flex-col">
            <div className="p-4 border-b border-gold/60">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search customers…" className="pl-9 bg-white/80 rounded-full h-10 border-gold/60" />
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
                      <p className="font-medium text-navy text-sm truncate">{t.customerName || "Customer"}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{t.time}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
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

          {/* Conversation */}
          <div className="flex flex-col bg-white/40">
            {thread ? (
              <>
                <div className="px-5 py-4 border-b border-gold/60 bg-white/80 flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-2xl ${thread.tint} flex items-center justify-center font-display text-sm shadow-luxe`}>
                    {thread.initial}
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-navy">{thread.customerName || "Customer"}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      {thread.online ? (
                        <><Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" /> Online</>
                      ) : "Last seen recently"}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setAiModes(prev => ({ ...prev, [active]: prev[active] === false ? true : false }));
                      // Also send a system message to indicate handover
                      const newMsg: Msg = {
                        id: Date.now().toString(),
                        from: "them",
                        system: true,
                        text: aiModes[active] === false ? "AI Assistant has been reactivated by the tailor." : "AI Assistant disabled. Human tailor will reply.",
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      };
                      setConversation(prev => ({ ...prev, [active]: [...(prev[active] || []), newMsg] }));
                    }}
                    className={`rounded-full h-8 text-[10px] gap-1 ${aiModes[active] !== false ? 'border-gold text-gold bg-gold/10 hover:bg-gold/20 shadow-none' : 'bg-gradient-gold text-navy-deep shadow-glow hover:opacity-90'}`}
                    variant={aiModes[active] !== false ? "outline" : "default"}
                  >
                    <Bot className="h-3 w-3" />
                    {aiModes[active] !== false ? "Turn Off AI" : "Delegate to AI"}
                  </Button>
                </div>

                <div className="flex-1 overflow-auto p-5 space-y-3">
                  {msgs.map((m) => (
                    <div key={m.id} className={`flex ${m.from === "them" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-luxe relative
                        ${m.system ? "bg-amber-100 text-amber-800 text-xs text-center border-none w-full shadow-none max-w-full my-4" : 
                          m.from === "them" ? "bg-gradient-navy text-cream rounded-br-md" : "bg-cream rounded-bl-md border border-gold/60"}`}>
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
                          <div className={`flex items-center gap-1 mt-1 text-[10px] ${m.from === "them" ? "text-cream/70 justify-end" : "text-muted-foreground"}`}>
                            <span>{m.time}</span>
                            {m.from === "them" && (m.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-gold/60 bg-white/80">
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
                      placeholder="Reply to customer…"
                      className="flex-1 rounded-full bg-cream border-gold/60 h-11"
                    />
                    <Button className="rounded-full bg-gradient-navy text-cream h-11 px-5 gap-2" onClick={handleSend}>
                      <Send className="h-4 w-4 text-cream" /> Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-mocha/50 text-sm">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </Card>
    </PageShell>
  );
}






