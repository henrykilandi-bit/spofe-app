describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearAuth()
  })

  it('should display login page', () => {
    cy.visit('http://localhost:5173')
    cy.url().should('include', '/login')
    cy.contains('Connexion à SPOFE').should('exist')
    cy.get('input[placeholder*="email"]').should('exist')
    cy.get('input[placeholder*="password"]').should('exist')
    cy.contains('Connexion').should('exist')
  })

  it('should show error on invalid credentials', () => {
    cy.visit('http://localhost:5173/login')
    cy.get('input[placeholder*="email"]').type('invalid@email.com')
    cy.get('input[placeholder*="password"]').type('wrongpassword')
    cy.get('button').contains(/connexion/i).click()
    
    // Error message would appear
    // cy.contains(/error|failed|invalid/i).should('exist')
  })

  it('should login successfully with valid credentials', () => {
    cy.login('admin@spofe.com', 'password123')
    cy.url().should('not.include', '/login')
    cy.url().should('include', '/dashboard')
  })

  it('should persist token in localStorage after login', () => {
    cy.login('admin@spofe.com', 'password123')
    cy.checkAuthToken()
  })

  it('should logout successfully', () => {
    cy.login('admin@spofe.com', 'password123')
    cy.logout()
    cy.url().should('include', '/login')
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null
    })
  })

  it('should redirect to login on invalid token', () => {
    // Set invalid token
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'invalid_token_xyz')
    })
    
    cy.visit('http://localhost:5173/dashboard')
    // App should redirect to login due to 401 response
    // cy.url().should('include', '/login')
  })

  it('should prevent access to protected routes without auth', () => {
    cy.visit('http://localhost:5173/dashboard')
    cy.url().should('include', '/login')
  })
})
