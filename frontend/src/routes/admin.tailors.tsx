import { createFileRoute } from "@tanstack/react-router";
import { SectionShell } from "@/components/SectionShell";
export const Route = createFileRoute("/admin/tailors")({
  component: () => <SectionShell eyebrow="Atelier directory" title="Tailors" subtitle="Onboarded ateliers, performance ratings, and verification status across every region." />,
});






