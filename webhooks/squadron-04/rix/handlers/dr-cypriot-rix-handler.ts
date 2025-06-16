import { Request, Response } from 'express';
import { RixWebhookPayload, ApiResponse } from '../../types';

interface AIRewardResult {
  rewardId: string;
  agentId: string;
  contributionType: string;
  points: number;
  metadata: {
    category: string;
    impact: number;
    complexity: number;
  };
  timestamp: string;
}

export class DrCypriotRixWebhookHandler {
  public async handleRixWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body as RixWebhookPayload;
      
      // Validate squadron ID
      if (payload.squadronId !== '06') {
        throw new Error('Invalid Squadron ID for Dr. Cypriot handler');
      }

      // Process AI rewards
      const result = await this.processRewards(payload);
      
      const response: ApiResponse<AIRewardResult> = {
        status: 'success',
        message: 'AI Rewards RIX webhook processed successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('AI Rewards RIX webhook processing error:', error);
      const response: ApiResponse = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      res.status(500).json(response);
    }
  }

  private async processRewards(payload: RixWebhookPayload): Promise<AIRewardResult> {
    const points = this.calculateRewardPoints(payload);
    const metadata = this.generateRewardMetadata(payload);

    return {
      rewardId: this.generateRewardId(),
      agentId: payload.agentId,
      contributionType: payload.type,
      points,
      metadata,
      timestamp: new Date().toISOString()
    };
  }

  private calculateRewardPoints(payload: RixWebhookPayload): number {
    // Calculate points based on task type and priority
    const basePoints = 50;
    const priorityMultiplier = payload.data.priority / 5;
    const typeMultiplier = this.getTypeMultiplier(payload.type);
    
    return Math.floor(basePoints * priorityMultiplier * typeMultiplier);
  }

  private getTypeMultiplier(type: string): number {
    // Define multipliers for different task types
    const multipliers: Record<string, number> = {
      'agent_orchestration': 1.5,
      'task_delegation': 1.2,
      'co_pilot_assist': 1.3
    };
    return multipliers[type] || 1.0;
  }

  private generateRewardMetadata(payload: RixWebhookPayload): AIRewardResult['metadata'] {
    return {
      category: this.determineCategory(payload),
      impact: this.calculateImpact(payload),
      complexity: this.assessComplexity(payload)
    };
  }

  private generateRewardId(): string {
    // Generate a unique reward ID
    return `reward-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineCategory(payload: RixWebhookPayload): string {
    // Determine reward category based on task type
    switch (payload.type) {
      case 'agent_orchestration': return 'ORCHESTRATION';
      case 'task_delegation': return 'DELEGATION';
      case 'co_pilot_assist': return 'ASSISTANCE';
      default: return 'GENERAL';
    }
  }

  private calculateImpact(payload: RixWebhookPayload): number {
    // Calculate task impact score (0-10)
    return Math.min(payload.data.priority * 1.5, 10);
  }

  private assessComplexity(payload: RixWebhookPayload): number {
    // Assess task complexity (0-10)
    const baseComplexity = 5;
    const contextFactor = Object.keys(payload.data.context).length / 10;
    return Math.min(baseComplexity + contextFactor, 10);
  }
}


