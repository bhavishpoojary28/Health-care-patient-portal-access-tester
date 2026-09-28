// Custom command to perform portal login and guarantee auth session is established
Cypress.Commands.add('loginAs', (username, password) => {
  cy.clearLocalStorage();
  cy.visit('/login');
  cy.contains('Healthcare Patient Portal').should('be.visible');
  cy.get('input[type="text"]').clear().type(username);
  cy.get('input[type="password"]').clear().type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login');
  cy.window().its('localStorage.health_token').should('exist');
});
