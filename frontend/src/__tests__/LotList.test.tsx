import { render, screen } from "@testing-library/react";

import { LotList } from "@/components/LotList";

describe("LotList", () => {
  it("renders lots", () => {
    render(
      <LotList
        lots={[
          { id: 1, lot_uid: "LOT-1", warehouse_id: 1, storage_date: "2026-01-01", status: "conforme" },
        ]}
      />
    );
    expect(screen.getByText(/LOT-1/)).toBeInTheDocument();
  });
});
