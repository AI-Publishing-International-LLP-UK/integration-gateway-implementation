import { loadRixSecrets } from '../utils/secret-manager';

async function initialize() {
  try {
    // Load secrets into environment variables
    await loadRixSecrets();
    
    console.log('Initialization complete - all secrets loaded');
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
}

initialize();

