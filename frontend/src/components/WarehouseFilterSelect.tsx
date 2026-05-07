"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Select } from "@/components/ui/select";
import { Warehouse } from "@/types";

type Props = {
  warehouses: Warehouse[];
  selectedWarehouseId: number | null;
  resetPageOnChange?: boolean;
};

export function WarehouseFilterSelect({ warehouses, selectedWarehouseId, resetPageOnChange = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onWarehouseChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete("warehouseId");
    } else {
      params.set("warehouseId", value);
    }
    if (resetPageOnChange) {
      params.delete("page");
    }
    router.push(params.size ? `${pathname}?${params.toString()}` : pathname);
  }

  return (
    <Select value={selectedWarehouseId?.toString() ?? ""} onChange={(event) => onWarehouseChange(event.target.value)}>
      <option value="">Tous les entrepots</option>
      {warehouses.map((warehouse) => (
        <option key={warehouse.id} value={warehouse.id}>
          {warehouse.name} (#{warehouse.id})
        </option>
      ))}
    </Select>
  );
}
