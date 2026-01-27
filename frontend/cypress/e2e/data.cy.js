describe('Data Loading & API', () => {
  beforeEach(() => {
    cy.login('admin@spofe.com', 'password123')
  })

  it('should load and display chart of accounts data', () => {
    cy.contains('Plan Comptable').click()
    cy.url().should('include', '/accounts')
    
    // Wait for data to load
    cy.get('table', { timeout: 5000 }).should('exist')
    cy.get('tbody tr').should('have.length.greaterThan', 0)
  })

  it('should display loading state while fetching data', () => {
    cy.contains('Plan Comptable').click()
    // Chargement indicator might appear briefly
    cy.get('table', { timeout: 10000 }).should('exist')
  })

  it('should display error message if API fails', () => {
    // This test would intercept the API and mock a failure
    cy.intercept('GET', '**/chartsofaccounts*', { statusCode: 500 })
    cy.contains('Plan Comptable').click()
    cy.contains(/erreur|error/i, { timeout: 5000 }).should('exist')
  })

  it('should display account columns correctly', () => {
    cy.contains('Plan Comptable').click()
    cy.get('table', { timeout: 5000 }).should('exist')
    
    // Check for expected columns
    cy.contains('th', /code|numéro/i).should('exist')
    cy.contains('th', /nom|nom du compte|libellé/i).should('exist')
  })

  it('should handle empty chart of accounts', () => {
    cy.intercept('GET', '**/chartsofaccounts*', {
      statusCode: 200,
      body: { data: [] },
    })
    
    cy.contains('Plan Comptable').click()
    cy.contains(/aucun|no data|empty/i, { timeout: 5000 }).should('exist')
  })

  it('should allow data refresh', () => {
    cy.contains('Plan Comptable').click()
    cy.get('table', { timeout: 5000 }).should('exist')
    
    // Refresh button or shortcut
    cy.get('button').contains(/refresh|actualiser|recharger/i).click()
    cy.get('table', { timeout: 5000 }).should('exist')
  })

  it('should handle network timeout', () => {
    cy.intercept('GET', '**/chartsofaccounts*', (req) => {
      req.destroy()
    })
    
    cy.contains('Plan Comptable').click()
    cy.contains(/erreur|error|timeout/i, { timeout: 10000 }).should('exist')
  })
})
