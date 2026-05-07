import { Badge } from "@/components/ui/badge";

type Props = {
  status: string;
};

type StatusConfig = {
  label: string;
  variant: "default" | "secondary" | "warning" | "destructive";
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  conforme: { label: "Conforme", variant: "default" },
  alerte: { label: "Alerte", variant: "warning" },
  risque: { label: "Risque", variant: "warning" },
  bientot_perime: { label: "Bientot perime", variant: "warning" },
  perime: { label: "Perime", variant: "destructive" },
  expedie: { label: "Expedie", variant: "secondary" },
};

function formatFallback(status: string): string {
  return status.replaceAll("_", " ");
}

export function LotStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? { label: formatFallback(status), variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
