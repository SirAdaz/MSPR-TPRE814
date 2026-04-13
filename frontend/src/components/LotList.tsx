import { Lot } from "@/types";

interface Props {
  lots: Lot[];
}

export function LotList({ lots }: Props) {
  return (
    <ul>
      {lots.map((lot) => (
        <li key={lot.id}>
          {lot.lot_uid} - {lot.storage_date} - {lot.status}
        </li>
      ))}
    </ul>
  );
}
