import { Lot } from "@/types";
import { LotStatusBadge } from "@/components/LotStatusBadge";

interface Props {
  lots: Lot[];
}

export function LotList({ lots }: Props) {
  return (
    <ul>
      {lots.map((lot) => (
        <li key={lot.id}>
          {lot.lot_uid} - {lot.storage_date} - <LotStatusBadge status={lot.status} />
        </li>
      ))}
    </ul>
  );
}
