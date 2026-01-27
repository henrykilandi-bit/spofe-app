// Custom commands for Cypress tests
Cypress.Commands.add('login', (email = 'admin@spofe.com', password = 'password123') => {
  cy.visit('http://localhost:5173/login')
  cy.get('input[placeholder*="email"]').type(email)
  cy.get('input[placeholder*="password"]').type(password)
  cy.get('button').contains(/connexion|login/i).click()
  cy.url().should('not.include', '/login')
})

Cypress.Commands.add('logout', () => {
  cy.get('button').contains(/logout|déconnexion/i).click()
  cy.url().should('include', '/login')
})

Cypress.Commands.add('checkAuthToken', () => {
  const token = localStorage.getItem('token')
  expect(token).to.exist
})

Cypress.Commands.add('clearAuth', () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  cy.visit('http://localhost:5173/login')
})
