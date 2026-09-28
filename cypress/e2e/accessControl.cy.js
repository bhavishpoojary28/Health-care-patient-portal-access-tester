import '../support/commands';

describe('Access Control & IDOR Protection E2E Tests', () => {
  beforeEach(() => {
    cy.loginAs('patientA', 'Password123!');
  });

  it('Demonstration Feature: Access Control Tester blocks cross-patient data access', () => {
    cy.visit('/access-tester');
    cy.contains('Access Control Tester').should('be.visible');

    // 1. Select User: Patient A (P1001)
    cy.get('select').eq(0).select('patientA');

    // 2. Select Target: Patient B (P1002)
    cy.get('select').eq(1).select('P1002');

    // 3. Select Resource: Medical Report
    cy.get('select').eq(2).select('Medical Report');

    // 4. Click Run Access Test
    cy.contains('button', 'Run Access Test').click();

    // 5. Verify Output Display
    cy.contains('Expected Security Outcome').should('be.visible');
    cy.contains('ACCESS DENIED').should('be.visible');
    cy.contains('Actual Backend Response').should('be.visible');
    cy.contains('HTTP 403').should('be.visible');
    cy.contains('PASS').should('be.visible');
    cy.contains('Real-time Audit Log Entry Generated').should('be.visible');
  });

  it('Demonstration Feature: Access Control Tester allows legitimate self-access', () => {
    cy.visit('/access-tester');

    // Select User: Patient A
    cy.get('select').eq(0).select('patientA');

    // Select Target: Patient A
    cy.get('select').eq(1).select('P1001');

    // Select Resource: Profile
    cy.get('select').eq(2).select('Profile');

    // Run test
    cy.contains('button', 'Run Access Test').click();

    // Verify allowed
    cy.contains('ACCESS GRANTED').should('be.visible');
    cy.contains('HTTP 200').should('be.visible');
    cy.contains('PASS').should('be.visible');
  });

  it('Patient A attempting to directly view Patient B profile is blocked with 403 error', () => {
    // Attempt URL tamper / IDOR attack: /profile?patientId=P1002
    cy.visit('/profile?patientId=P1002');

    cy.contains('Access Control Violation (403)').should('be.visible');
    cy.contains('You do not have permission to view or manipulate data for patient P1002').should('be.visible');
  });
});
