import '../support/commands';

describe('Software Testing Dashboard & RBAC E2E Tests', () => {
  it('Admin can view testing dashboard metrics and test cases', () => {
    cy.loginAs('admin', 'AdminPass123!');
    cy.visit('/testing');

    cy.contains('Software Testing Dashboard').should('be.visible');
    cy.contains('Total Test Cases').should('be.visible');
    cy.contains('Pass Rate').should('be.visible');

    // Verify test cases exist in table (TC001 to TC010)
    cy.get('td').contains('TC001').should('be.visible');
    cy.get('td').contains('TC004').should('be.visible');
    cy.contains('Valid patient login').should('be.visible');
  });

  it('Admin can execute a test case live from the dashboard table', () => {
    cy.loginAs('admin', 'AdminPass123!');
    cy.visit('/testing');

    cy.get('td').contains('TC001').should('be.visible');
    // Run first test case live
    cy.get('button[title="Run Test Live"]').first().click();
    cy.get('tbody').contains('PASS').should('be.visible');
  });

  it('Patient role is restricted and redirected to /access-denied when visiting /testing', () => {
    cy.loginAs('patientA', 'Password123!');
    cy.visit('/testing');

    cy.url().should('include', '/access-denied');
    cy.contains('Access Control Denied').should('be.visible');
    cy.contains('HTTP 403 Forbidden').should('be.visible');
  });
});
