import './commands';

// Catch uncaught exceptions so tests don't fail unexpectedly on third-party noise
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
