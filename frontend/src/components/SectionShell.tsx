import { PageShell } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { ReactNode } from "react";

export function SectionShell({
  title, subtitle, eyebrow, children, action,
}: {
  title: string;
  subtitle: string;
  eyebrow: string;
  children?: ReactNode;
  action?: { label: string; icon?: ReactNode };
}) {
  return (
    <PageShell title={title} subtitle={subtitle}>
      <Card className="relative overflow-hidden p-8 lg:p-12 border-0 shadow-navy bg-gradient-navy text-cream rounded-[2.5rem]">
        <div className="absolute -top-32 -right-16 h-80 w-80 rounded-full bg-gold/30 blur-3xl opacity-50" />
        <div className="absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-navy-deep/40 blur-3xl" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 text-gold text-[10px] uppercase tracking-[0.3em] font-medium backdrop-blur-md">
              <Sparkles className="h-3 w-3" /> {eyebrow}
            </div>
            <h2 className="font-display text-5xl lg:text-6xl mt-6 leading-[1.1] text-balance tracking-tight">{title}</h2>
            <p className="text-cream/70 text-base mt-4 max-w-xl font-sans tracking-wide leading-relaxed">{subtitle}</p>
          </div>
          {action && (
            <Button className="bg-gradient-gold text-navy-deep hover:opacity-95 rounded-2xl h-14 px-8 shadow-glow gap-3 self-start md:self-center font-bold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              {action.icon}
              {action.label}
            </Button>
          )}
        </div>
      </Card>

      {children ?? (
        <Card className="p-20 border-border/40 shadow-luxe text-center bg-gradient-cream rounded-[2.5rem] mt-8">
          <div className="mx-auto h-20 w-20 rounded-3xl bg-gradient-gold flex items-center justify-center shadow-glow mb-6 animate-float">
            <Sparkles className="h-9 w-9 text-navy-deep" />
          </div>
          <h3 className="font-display text-3xl text-navy tracking-tight">Coming together beautifully</h3>
          <p className="text-base text-mocha/70 mt-3 max-w-md mx-auto">
            This space is reserved for your luxury experience. We're polishing the final stitches.
          </p>
        </Card>
      )}
    </PageShell>
  );
}





