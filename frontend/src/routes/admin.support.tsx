import { createFileRoute } from "@tanstack/react-router";
import { SectionShell } from "@/components/SectionShell";
export const Route = createFileRoute("/admin/support")({
  component: () => <SectionShell eyebrow="Care center" title="Support tickets" subtitle="Triage, assign, and resolve customer and tailor tickets — SLA-aware queues built in." />,
});






