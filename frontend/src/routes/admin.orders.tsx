import { createFileRoute } from "@tanstack/react-router";
import { SectionShell } from "@/components/SectionShell";
export const Route = createFileRoute("/admin/orders")({
  component: () => <SectionShell eyebrow="Platform operations" title="All orders" subtitle="Every order across every atelier — filter by status, value, or city." />,
});






