import { createFileRoute } from "@tanstack/react-router";
import { SectionShell } from "@/components/SectionShell";
export const Route = createFileRoute("/admin/customers")({
  component: () => <SectionShell eyebrow="Members" title="Customer accounts" subtitle="Lifetime value, order frequency, and account health for every customer." />,
});






