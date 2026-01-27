describe("Wizard vers Dashboard", () => {
  it("création et soumission opération", () => {
    cy.login("user@spofe-demo.local", "password");

    cy.visit("/wizard");
    cy.get("input[name=amount]").type("1200000");
    cy.contains("Soumettre").click();

    cy.contains("Envoyée pour validation");
    cy.visit("/dashboard");
    cy.contains("en attente");
  });

  it("validation comptable impact dashboard", () => {
    cy.login("admin@spofe-demo.local", "password");

    cy.visit("/validations");
    cy.contains("Valider").click();

    cy.contains("Écriture validée");
    cy.visit("/dashboard");
    cy.contains("en attente").should("not.exist");
  });

  it("rejet avec motif visible", () => {
    cy.login("admin@spofe-demo.local", "password");

    cy.contains("Rejeter").click();
    cy.get("textarea").type("Montant incorrect");
    cy.contains("Confirmer").click();

    cy.login("user@spofe-demo.local", "password");
    cy.contains("Opération rejetée");
  });
});
