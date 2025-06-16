import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

interface SecretConfig {
  projectId: string;
  secretId: string;
  version?: string;
}

export async function getSecret(config: SecretConfig): Promise<string> {
  try {
    const version = config.version || 'latest';
    const name = `projects/${config.projectId}/secrets/${config.secretId}/versions/${version}`;
    
    const [response] = await client.accessSecretVersion({
      name: name
    });

    const secretValue = response.payload?.data?.toString() || '';
    return secretValue;
  } catch (error) {
    console.error(`Error accessing secret ${config.secretId}:`, error);
    throw error;
  }
}

export async function loadRixSecrets(): Promise<void> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || '';
  if (!projectId) {
    throw new Error('GOOGLE_CLOUD_PROJECT environment variable not set');
  }

  try {
    // Load Squadron 04 RIX secrets
    const rixConfig = JSON.parse(
      await getSecret({
        projectId,
        secretId: 'squadron-04-rix-config'
      })
    );

    // Set environment variables for use in handlers
    process.env.RIX_WEBHOOK_SECRET = rixConfig.webhook_secret;
    process.env.RIX_API_KEY = rixConfig.api_key;
    process.env.RIX_PRIMARY_KEY = rixConfig.signature_keys.primary;
    process.env.RIX_SECONDARY_KEY = rixConfig.signature_keys.secondary;
    
    // Quantum keys
    process.env.QRIX_ENCRYPTION_KEY = rixConfig.quantum.encryption_key;
    process.env.QRIX_STATE_SYNC_KEY = rixConfig.quantum.state_sync_key;
    
    // Integration keys
    process.env.DR_MARIA_API_KEY = rixConfig.integrations.dr_maria.task_api_key;
    process.env.DR_CYPRIOT_API_KEY = rixConfig.integrations.dr_cypriot.process_api_key;

    console.log('Successfully loaded Squadron 04 RIX secrets');
  } catch (error) {
    console.error('Error loading RIX secrets:', error);
    throw error;
  }
}

