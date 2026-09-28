const cypress = require('cypress');

// Remove ELECTRON_RUN_AS_NODE to prevent Node 24 incompatibility with Cypress Electron binary
delete process.env.ELECTRON_RUN_AS_NODE;

const args = process.argv.slice(2);
const command = args[0] || 'run';

if (command === 'open') {
  cypress.open().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  cypress.run({
    config: {
      video: false,
      screenshotOnRunFailure: false,
    }
  }).then((results) => {
    if (results.totalFailed > 0 || results.status === 'failed') {
      console.error('Cypress tests failed with failures count:', results.totalFailed || results.status);
      process.exit(1);
    }
    console.log('All Cypress tests completed successfully!');
    process.exit(0);
  }).catch((err) => {
    console.error('Cypress error:', err);
    process.exit(1);
  });
}
