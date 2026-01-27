// Support file for Cypress tests
import './commands'

beforeEach(() => {
  // Clear auth before each test
  localStorage.removeItem('user')
  localStorage.removeItem('token')
})

afterEach(() => {
  // Cleanup after each test
  cy.clearCookies()
})
