describe("home", () => {
  it("shows countries links", () => {
    cy.visit("/");
    cy.contains("Bresil");
    cy.contains("Equateur");
    cy.contains("Colombie");
  });
});
