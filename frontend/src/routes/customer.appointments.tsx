import { createFileRoute } from "@tanstack/react-router";
import { SectionShell } from "@/components/SectionShell";
export const Route = createFileRoute("/customer/appointments")({
  component: () => <SectionShell eyebrow="Fittings & visits" title="Appointments" subtitle="Book consultations, trial sessions, and home pickups across all your saved tailors." />,
});






