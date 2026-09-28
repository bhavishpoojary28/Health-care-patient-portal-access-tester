import '../support/commands';

describe('Authentication & Session E2E Tests', () => {
  it('TC001: Valid patient logs in successfully and sees their dashboard', () => {
    cy.visit('/login');
    cy.contains('Healthcare Patient Portal').should('be.visible');

    // Fill credentials
    cy.get('input[type="text"]').clear().type('patientA');
    cy.get('input[type="password"]').clear().type('Password123!');
    cy.get('button[type="submit"]').click();

    // Verify redirected to dashboard with John Doe identity
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains('Welcome, John Doe').should('be.visible');
    cy.contains('PATIENT PORTAL').should('be.visible');
    cy.contains('P1001').should('be.visible');
  });

  it('TC002: Login with incorrect password displays error message', () => {
    cy.visit('/login');
    cy.get('input[type="text"]').clear().type('patientA');
    cy.get('input[type="password"]').clear().type('WrongPassword!');
    cy.get('button[type="submit"]').click();

    cy.contains('Authentication Error').should('be.visible');
    cy.contains('The username or password provided is incorrect').should('be.visible');
  });

  it('Protected routes redirect unauthenticated users to /login', () => {
    // Clear localStorage to ensure guest
    cy.clearLocalStorage();
    cy.visit('/profile');
    cy.url().should('include', '/login');

    cy.visit('/reports');
    cy.url().should('include', '/login');
  });

  it('User logs out successfully and session is cleared', () => {
    cy.loginAs('patientA', 'Password123!');
    cy.contains('Welcome, John Doe').should('be.visible');

    // Click logout
    cy.get('button[title="Logout"]').click();
    cy.url().should('include', '/login');
  });
});
