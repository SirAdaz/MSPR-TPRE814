describe("critical flow", () => {
  it("logs in, opens a country, filters by warehouse and shows alerts", () => {
    cy.visit("/login");

    cy.get('input[type="email"]').clear().type("admin@futurekawa.local");
    cy.get('input[type="password"]').clear().type("Admin123!");
    cy.contains("button", "Se connecter").click();

    cy.url().should("not.include", "/login");

    cy.visit("/country/BR");
    cy.contains("Selection d'entrepot").should("be.visible");
    cy.contains("Alertes de l'entrepot").should("be.visible");

    cy.get("select")
      .first()
      .find("option")
      .eq(1)
      .then(($option) => {
        const warehouseValue = $option.attr("value");
        expect(warehouseValue, "warehouse option value").to.not.equal("");
        cy.get("select").first().select(String(warehouseValue));
      });

    cy.url().should("include", "warehouseId=");
    cy.contains("Aucune alerte pour ce filtre.").should("not.exist");
    cy.contains("Alertes de l'entrepot")
      .parentsUntil("main")
      .parent()
      .find("li")
      .its("length")
      .should("be.gte", 1);
  });
});
