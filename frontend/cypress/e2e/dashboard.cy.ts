describe("Dashboard SPOFE", () => {
  beforeEach(() => {
    cy.login("coach@spofe-demo.local", "password");
    cy.visit("/dashboard");
  });

  it("affiche le message de situation", () => {
    cy.contains("Situation actuelle").should("be.visible");
  });

  it("affiche les KPI principaux", () => {
    cy.contains("Résultat").should("exist");
    cy.contains("Tension de trésorerie").should("exist");
  });

  it("affiche le nombre d'écritures en attente pour le coach", () => {
    cy.contains("Écritures en attente").should("exist");
  });

  it("ne montre pas la file de validation pour un utilisateur simple", () => {
    cy.login("user@spofe-demo.local", "password");
    cy.visit("/dashboard");
    cy.contains("Écritures en attente").should("not.exist");
  });
});
