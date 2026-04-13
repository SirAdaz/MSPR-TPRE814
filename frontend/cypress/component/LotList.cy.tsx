import { LotList } from "../../src/components/LotList";

describe("LotList component", () => {
  it("renders one lot", () => {
    cy.mount(
      <LotList lots={[{ id: 1, lot_uid: "LOT-1", warehouse_id: 1, storage_date: "2026-01-01", status: "conforme" }]} />
    );
    cy.contains("LOT-1");
  });
});
