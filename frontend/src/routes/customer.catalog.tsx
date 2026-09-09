import { createFileRoute } from "@tanstack/react-router";
import { SectionShell } from "@/components/SectionShell";
export const Route = createFileRoute("/customer/catalog")({
  component: () => <SectionShell eyebrow="Design library" title="Curated couture catalog" subtitle="Bridal, festive, formal — explore inspiration and send it directly to your tailor." />,
});






