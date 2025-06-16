export interface RixWebhookPayload {
  type: 'agent_orchestration' | 'task_delegation' | 'co_pilot_assist';
  agentId: string;
  squadronId: '04' | '05' | '06';
  taskId: string;
  timestamp: string;
  data: {
    intent: string;
    context: any;
    priority: number;
    rixType: 'pr-rix' | 'cw-rix';
  };
  security: {
    signature: string;
    nonce: string;
  };
}

export interface QrixQuantumState {
  coherence: number;
  entanglement: string[];
  superposition: number;
  squadronSync: {
    '04': number; // Dr. Claude sync state
    '05': number; // Dr. Maria sync state
    '06': number; // Dr. Cypriot sync state
  };
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

