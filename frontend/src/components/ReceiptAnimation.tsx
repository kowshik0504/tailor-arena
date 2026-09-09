import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

export function ReceiptAnimation({ data }: { data: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setDateStr(new Date().toLocaleString());
  }, []);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    let timer: any;
    let manualMode = false;
    let dragging = false;
    let dragStartY = 0;
    let dragDistance = 0;
    
    const inner = containerRef.current.querySelector("#inner") as HTMLElement;
    const receipt = containerRef.current.querySelector("#receipt") as HTMLElement;
    const confetti = containerRef.current.querySelector("#confetti") as HTMLElement;
    const manualBtn = containerRef.current.querySelector("#manualBtn") as HTMLElement;
    
    if (!inner || !receipt || !confetti) return;
    
    function showStage(stage: number) {
      if (manualMode) return;
      if (!inner || !receipt || !confetti) return;
      inner.classList.remove("stage-0", "stage-1", "stage-2", "stage-3", "show-confetti");
      receipt.classList.remove("fadeout");
      inner.classList.add("stage-" + stage);
      if (stage === 2 || stage === 3) {
        void confetti.offsetWidth;
        inner.classList.add("show-confetti");
        confetti.querySelectorAll(".piece").forEach((p: any, i: number) => {
          const side = (i % 2 ? 1 : -1);
          p.style.setProperty("--dx", (side * (35 + (i % 6) * 17)) + "px");
        });
      }
    }
    
    let startTime = Date.now();
    let loopId: number;
    
    function loop() {
      if (manualMode) { requestAnimationFrame(loop); return; }
      const t = (Date.now() - startTime) / 1000;
      
      // single sequence
      if (t < 0.45) showStage(0);
      else if (t < 1.15) showStage(1);
      else if (t < 3.45) showStage(2);
      else if (t < 4.15) showStage(3);
      else {
        // Stop looping, let it fade out and navigate
        inner?.classList.remove("stage-0", "stage-1", "stage-2", "stage-3", "show-confetti");
        receipt?.classList.add("fadeout");
        
        setTimeout(() => {
          navigate({ to: "/dashboard" });
        }, 1500);
        return; 
      }
      loopId = requestAnimationFrame(loop);
    }
    
    function startManualMode() {
      manualMode = true;
      if (!inner || !receipt) return;
      inner.classList.add("manual-mode");
      inner.classList.remove("stage-0", "stage-1", "stage-2", "stage-3", "show-confetti");
      receipt.classList.remove("fadeout", "manual-torn");
      receipt.style.height = "48px";
      receipt.style.transform = "translateY(0)";
      receipt.style.transition = "none";
      if (loopId) cancelAnimationFrame(loopId);
    }
    
    if (manualBtn) manualBtn.addEventListener("click", startManualMode);
    
    receipt.addEventListener("pointerdown", (e) => {
      if (!manualMode) return;
      dragging = true;
      dragStartY = e.clientY;
      dragDistance = 0;
      receipt.classList.add("dragging");
      if (receipt.setPointerCapture) receipt.setPointerCapture(e.pointerId);
    });
    
    receipt.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      dragDistance = Math.max(0, e.clientY - dragStartY);
      const h = Math.min(600, 48 + dragDistance * 1.15); // increased max height
      const tug = Math.sin(dragDistance / 12) * 1.5;
      receipt.style.height = h + "px";
      receipt.style.transform = `translateY(${tug}px) rotate(${Math.sin(dragDistance / 18) * 0.12}deg)`;
    });
    
    function finishManualTear() {
      if (!dragging) return;
      dragging = false;
      if (!receipt || !inner || !confetti) return;
      receipt.classList.remove("dragging");
    
      if (dragDistance >= 115) {
        receipt.classList.add("manual-torn");
        receipt.style.transition = "height .38s cubic-bezier(.2,.85,.22,1), transform .18s ease";
        receipt.style.height = "600px";
        receipt.style.transform = "translateY(0)";
        setTimeout(() => {
          if (!receipt || !inner || !confetti) return;
          receipt.style.transition = "none";
          inner.classList.remove("manual-mode");
          inner.classList.add("stage-1"); // or stage-2 for full height
          confetti.querySelectorAll(".piece").forEach((p:any) => p.style.opacity = "0");
          
          setTimeout(() => {
             navigate({ to: "/dashboard" });
          }, 3000);
        }, 420);
      } else {
        receipt.style.transition = "height .28s ease, transform .2s ease";
        receipt.style.height = "48px";
        receipt.style.transform = "translateY(0)";
        setTimeout(() => { if (receipt) receipt.style.transition = "none" }, 300);
      }
    }
    
    receipt.addEventListener("pointerup", finishManualTear);
    receipt.addEventListener("pointercancel", finishManualTear);
    
    receipt.addEventListener("click", () => {
      if (!manualMode) startManualMode();
    });
    
    // Confetti
    if (confetti) {
      confetti.innerHTML = "";
      for(let i = 0; i < 17; i++){
        const p = document.createElement("span");
        p.className = "piece";
        p.style.left = (i * 43 - 12) + "px";
        p.style.top = (5 + (i % 4) * 12) + "px";
        p.style.background = ["#ef4b65", "#f0a12d", "#38b889", "#5b79df", "#9b67d9", "#f3c64c"][i % 6];
        confetti.appendChild(p);
      }
    }
    
    loopId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(loopId);
  }, [navigate]);

  return (
    <div className="scene" ref={containerRef}>
      <div className="inner" id="inner">
        <div className="title">Payment confirmed</div>
        <div className="subtitle">Registration Successful</div>
        
        <button id="manualBtn" style={{ position:"absolute",top:"260px",left:"50%",transform:"translateX(-50%)",border:0,borderRadius:"22px",padding:"10px 20px",background:"#fff",boxShadow:"0 5px 18px rgba(40,45,80,.12)",font:"600 14px Poppins,Arial",color:"#555",cursor:"pointer",zIndex:30 }}>Manual tear</button>

        <div className="terminal-wrap">
          <div className="terminal" id="terminal" style={{ "--top": "#f8d99b", "--mid": "#dda642", "--dark": "#a66c13" } as any}>
            <div className="slot"></div>
            <div className="led" id="led" style={{ background: "#f09a27" }}></div>
          </div>
        </div>

        <div className="receipt" id="receipt">
          <div className="tear-shiver"></div>
          <div className="tear-zone"><div className="tear-line-live"></div></div>
          
          <div className="top" id="merchantTop">
             <h2>Tailor Arena</h2>
             <p>Registration Fee</p>
          </div>
          
          <div className="cut"></div>
          
          <div className="details">
            <div className="row">
              <div><div className="label">TRANSACTION ID</div><div className="value">{data.txId || "TX-9988221"}</div></div>
              <div className="right"><div className="label">AMOUNT</div><div className="value">Rs. {data.amount || "1,499.00"}</div></div>
            </div>
            
            <div className="row" style={{ marginTop: "19px" }}>
              <div><div className="label">DATE & TIME</div><div className="value">{dateStr}</div></div>
              <div className="right"><div className="label">STATUS</div><div className="status">Confirmed</div></div>
            </div>
            
            <div className="pay" id="pay">
              <div className="pay-logo master-logo"></div>
              <div>
                <div className="pay-text">{data.name || "Tailor Name"}</div>
                <div className="pay-sub">Tailor Arena Membership</div>
              </div>
            </div>
            
            <div style={{ marginTop: "20px", padding: "10px", background: "#f4f3ff", borderRadius: "8px", fontSize: "12px", color: "#555" }}>
               <strong>{data.shopName || "Atelier Shop"}</strong><br/>
               {data.address || "123 Fashion St, Mumbai"}<br/>
               GST: {data.gstin || "Not provided"}<br/>
               Ph: {data.phone || "Not provided"} <br/>
               Em: {data.email || "Not provided"}
            </div>
            
          </div>
        </div>

        <div className="manual-hint">Swipe down on the receipt to tear it out</div>
        <div className="confetti" id="confetti"></div>
      </div>
      
      <style>{`
        .scene{ width:100vw;height:100vh;min-height:600px; position:relative;overflow:hidden; background: radial-gradient(ellipse at 50% 34%,rgba(255,255,255,.95) 0 17%,rgba(255,255,255,0) 43%), #f4f3ff; font-family:Poppins,Arial,sans-serif; }
        .inner{ position:absolute;left:50%;top:0; width:720px;height:1280px; transform:translateX(-50%); transform-origin:top center; }
        .title{ position:absolute;top:140px;left:0;width:100%; text-align:center;font-size:42px;line-height:1.05; font-weight:500;letter-spacing:-1.8px; }
        .subtitle{ position:absolute;top:201px;left:0;width:100%; text-align:center;font-size:41px;line-height:1; color:#1976df;font-weight:500;letter-spacing:-1.3px; }
        .terminal-wrap{ position:absolute;left:95px;top:342px;width:520px;height:92px; z-index:8; filter:drop-shadow(0 13px 12px rgba(45,50,80,.18)); }
        .terminal{ position:absolute;left:0;top:0;width:520px;height:64px; border-radius:17px 17px 10px 10px; background:linear-gradient(#fff 0%,var(--top,#f5c875) 15%,var(--mid,#dda642) 58%,var(--dark,#a66c13) 100%); box-shadow:inset 0 3px 6px rgba(255,255,255,.95), inset 0 -3px 5px rgba(70,40,0,.24); transition:background .3s; }
        .terminal:after{ content:"";position:absolute;left:0;bottom:-18px;width:520px;height:22px; border-radius:0 0 16px 16px; background:linear-gradient(#707786,#28303e 70%,#171c25); box-shadow:inset 0 3px 2px rgba(255,255,255,.5); }
        .terminal .slot{ position:absolute;left:28px;right:28px;bottom:-5px;height:6px; border-radius:4px;background:#222630;z-index:2; }
        .led{ position:absolute;right:24px;top:25px;width:11px;height:11px;border-radius:50%; background:#2ac56b;box-shadow:0 0 9px rgba(42,197,107,.75);z-index:3; }
        .receipt{ position:absolute;left:147px;top:424px;width:426px;height:0; z-index:4;overflow:hidden; background:#fff; border-radius:0 0 18px 18px; box-shadow:0 13px 28px rgba(45,50,80,.13); transform-origin:top center; }
        .receipt.paper{ height:365px; }
        .receipt .top{ height:168px;text-align:center;padding-top:23px; position:relative; }
        .receipt .top h2{margin:0;font-size:30px;line-height:1.12;font-weight:700;letter-spacing:-1px}
        .receipt .top p{margin:8px 0 0;color:#7a7d88;font-size:17px;line-height:1.45}
        .cut{ height:1px;border-top:2px dotted #e5e5e9;position:relative;margin:0 16px; }
        .cut:before,.cut:after{ content:"";position:absolute;top:-14px;width:28px;height:28px;border-radius:50%;background:#f4f3ff; }
        .cut:before{left:-30px}.cut:after{right:-30px}
        .details{padding:28px 29px 0}
        .row{display:flex;justify-content:space-between;align-items:flex-start}
        .label{ font-size:12px;font-weight:600;color:#92949d;letter-spacing:1px; text-transform:uppercase;line-height:1.15; }
        .value{font-size:18px;font-weight:700;line-height:1.35;margin-top:4px;white-space:nowrap}
        .right{text-align:right}
        .status{ display:inline-block;margin-top:4px;padding:2px 10px;border-radius:13px; color:#2b9a6d;background:#e8fbf2;font-size:13px;font-weight:600; }
        .pay{ height:69px;margin-top:18px;border-radius:16px; background:#f5f5fb;border:1px solid #e9e9f0; display:flex;align-items:center;padding:0 20px;gap:18px; }
        .pay-logo{width:42px;display:flex;align-items:center;justify-content:center;flex:none}
        .pay-text{font-size:16px;font-weight:600;line-height:1.25}
        .pay-sub{font-size:15px;color:#737681;font-weight:500;margin-top:2px}
        .master-logo:before{ content:"";width:24px;height:24px;border-radius:50%;background:#e91c2b; box-shadow:12px 0 0 #f6a51a; }
        .confetti{position:absolute;left:0;top:300px;width:720px;height:260px;z-index:10;pointer-events:none;overflow:hidden}
        .piece{position:absolute;width:10px;height:17px;opacity:0;transform:translateY(-30px) rotate(0deg)}
        .piece:nth-child(3n){width:9px;height:13px}.piece:nth-child(4n){border-radius:50%}
        .piece:nth-child(5n){width:13px;height:8px}
        .show-confetti .piece{animation:burst 1.55s cubic-bezier(.2,.7,.25,1) forwards}
        .show-confetti .piece:nth-child(2n){animation-delay:.03s}.show-confetti .piece:nth-child(3n){animation-delay:.10s}
        .show-confetti .piece:nth-child(4n){animation-delay:.16s}.show-confetti .piece:nth-child(5n){animation-delay:.22s}
        @keyframes burst{ 0%{opacity:0;transform:translateY(-15px) rotate(0)} 12%{opacity:1} 100%{opacity:.9;transform:translate(var(--dx,0),230px) rotate(520deg)} }
        .receipt:before{ content:""; position:absolute; top:0;left:0;right:0;height:11px; z-index:7; background: radial-gradient(circle at 6px 11px, #f4f3ff 0 6px, transparent 6.5px) 0 0/18px 18px repeat-x; pointer-events:none; opacity:.95; }
        .receipt:after{ content:""; position:absolute; top:4px;left:16px;right:16px;height:2px; border-top:1px dashed rgba(170,173,183,.55); z-index:6; transform-origin:left center; pointer-events:none; }
        .tear-shiver{ position:absolute;left:0;right:0;top:-3px;height:18px;z-index:9; pointer-events:none;opacity:0; background:repeating-linear-gradient(90deg, transparent 0 7px, rgba(255,255,255,.95) 7px 10px, transparent 10px 18px); mix-blend-mode:screen; }
        .stage-0 .tear-shiver{ opacity:1; animation:tearShiver .14s linear infinite; }
        @keyframes tearShiver{ 0%{transform:translateX(-2px) rotate(-.25deg)} 50%{transform:translateX(1px) rotate(.25deg)} 100%{transform:translateX(-2px) rotate(-.25deg)} }
        .stage-0 .receipt{ transform:translateY(-2px) scaleY(.96); animation:paperStart .42s cubic-bezier(.18,.82,.22,1) forwards; }
        .stage-1 .receipt{ transform:translateY(0); animation:paperPull .72s cubic-bezier(.16,.82,.2,1) forwards; }
        .stage-2 .receipt,.stage-3 .receipt{ transform:translateY(0); }
        @keyframes paperStart{ 0%{height:0;transform:translateY(-7px) scaleY(.84)} 55%{height:34px;transform:translateY(1px) scaleY(1.02)} 78%{height:42px;transform:translateY(-1px) scaleY(.98)} 100%{height:48px;transform:translateY(0) scaleY(1)} }
        @keyframes paperPull{ 0%{height:48px;transform:translateY(-1px)} 18%{height:84px;transform:translateY(2px)} 34%{height:130px;transform:translateY(-1px)} 52%{height:205px;transform:translateY(2px)} 72%{height:290px;transform:translateY(-1px)} 88%{height:350px;transform:translateY(1px)} 100%{height:600px;transform:translateY(0)} }
        .stage-2 .receipt{ animation:receiptRelease .52s cubic-bezier(.2,.85,.22,1) forwards; }
        @keyframes receiptRelease{ 0%{transform:translateY(-1px)} 35%{transform:translateY(3px)} 58%{transform:translateY(-1px)} 78%{transform:translateY(1px)} 100%{transform:translateY(0)} }
        .cut:after{ content:""; position:absolute; left:25px;right:25px;top:-1px;height:3px; background:repeating-linear-gradient(90deg,#dedfe6 0 4px,transparent 4px 8px); opacity:.8; }
        .receipt{transition:none}
        .stage-0 .receipt{height:48px}
        .stage-1 .receipt{height:600px}
        .stage-1 .receipt .top{display:none}
        .stage-2 .receipt,.stage-3 .receipt{height:650px}
        .stage-2 .receipt .top,.stage-3 .receipt .top{display:block}
        .stage-0 .receipt{animation:slideTiny .45s ease-out}
        .stage-1 .receipt{animation:slideDetails .7s cubic-bezier(.2,.8,.25,1)}
        .stage-2 .receipt,.stage-3 .receipt{animation:slideFull .65s cubic-bezier(.2,.8,.25,1)}
        @keyframes slideTiny{from{height:0;transform:translateY(-4px)}to{height:48px;transform:none}}
        @keyframes slideDetails{from{height:48px}to{height:365px}}
        @keyframes slideFull{from{height:365px}to{height:650px}}
        .fadeout{animation:retract .55s ease-in forwards!important}
        @keyframes retract{0%{height:650px;transform:translateY(0)}25%{height:650px;transform:translateY(5px) rotate(.15deg)}45%{height:650px;transform:translateY(-2px) rotate(-.1deg)}100%{height:0;transform:translateY(-8px) rotate(0)}}
        @media(max-aspect-ratio:720/1280){ .inner{transform:translateX(-50%) scale(calc(100vw / 720))} }
        @media(min-aspect-ratio:720/1280){ .inner{transform:translateX(-50%) scale(calc(100vh / 1280))} }
        .receipt{ touch-action:none; user-select:none; cursor:grab; }
        .receipt.dragging{ cursor:grabbing; transition:none!important; }
        .tear-zone{ position:absolute; left:0;right:0;top:0;height:42px; z-index:20; pointer-events:none; }
        .tear-line-live{ position:absolute; left:14px;right:14px;top:9px;height:8px; opacity:0; border-top:2px dashed rgba(145,148,158,.8); }
        .receipt.dragging .tear-line-live{opacity:1}
        .receipt.manual-torn{ animation:none!important; overflow:visible; }
        .receipt.manual-torn .tear-zone{ opacity:0; }
        .manual-hint{ position:absolute; left:0;right:0;top:302px; text-align:center; font-size:14px; color:#858894; opacity:0; pointer-events:none; transition:opacity .2s; }
        .manual-mode .manual-hint{opacity:1}
        .manual-mode .receipt{animation:none!important;height:48px}
      `}</style>
    </div>
  );
}

