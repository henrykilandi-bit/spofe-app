describe('Navigation Flow', () => {
  beforeEach(() => {
    cy.login('admin@spofe.com', 'password123')
  })

  it('should display sidebar with navigation menu', () => {
    cy.get('aside').should('exist')
    cy.contains('Accueil').should('exist')
    cy.contains('Plan Comptable').should('exist')
    cy.contains('Journal').should('exist')
    cy.contains('Rapports').should('exist')
  })

  it('should navigate to dashboard', () => {
    cy.contains('Accueil').click()
    cy.url().should('include', '/dashboard')
    cy.contains('Bienvenue').should('exist')
  })

  it('should navigate to chart of accounts', () => {
    cy.contains('Plan Comptable').click()
    cy.url().should('include', '/accounts')
    cy.contains('Plan Comptable').should('exist')
  })

  it('should display header with logout button', () => {
    cy.get('header').should('exist')
    cy.contains('SPOFE').should('exist')
    cy.get('button').contains(/logout|déconnexion/i).should('exist')
  })

  it('should maintain navigation across page changes', () => {
    cy.contains('Plan Comptable').click()
    cy.url().should('include', '/accounts')
    
    cy.contains('Accueil').click()
    cy.url().should('include', '/dashboard')
    
    cy.contains('Plan Comptable').click()
    cy.url().should('include', '/accounts')
  })

  it('should show active navigation item', () => {
    cy.contains('Accueil').click()
    // Check if active state is applied
    cy.contains('Accueil').parent().should('have.class', 'bg-blue-100')
  })

  it('should handle navigation on small screens', () => {
    cy.viewport('iphone-x')
    cy.get('aside').should('exist')
    cy.contains('Accueil').should('exist')
  })
})
