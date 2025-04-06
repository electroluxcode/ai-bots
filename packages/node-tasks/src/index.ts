// Export all task node components
export * from './task-node.js';
export * from './task-executor.js';
export * from './task-manager.js';
export * from './scheduler.js';

// Re-export executeFlow from node-workflow for direct usage
import { executeFlow } from '@ai-bots/node-workflow';
export { executeFlow };

// Provide a simplified function for direct workflow execution
import { FlowDefinition, NodeResult } from '@ai-bots/types';

/**
 * Execute a workflow directly using the node-workflow executeFlow function
 * This is a simplified approach that matches the index.ts style in apps/mvp
 * 
 * @param workflow The workflow definition to execute
 * @param input The input data for the workflow
 * @returns Promise with workflow execution result
 */
export async function executeWorkflow(workflow: FlowDefinition, input: any): Promise<NodeResult> {
  const startTime = Date.now();
  
  try {
    // Directly use executeFlow from @ai-bots/node-workflow
    const result = await executeFlow(workflow, input);
    
    return {
      ...result,
      status: 'success',
      execution_time_ms: Date.now() - startTime
    };
  } catch (error) {
    console.error(`Workflow execution failed: ${error}`);
    return {
      status: 'failure',
      error: error instanceof Error ? error.message : String(error),
      execution_time_ms: Date.now() - startTime
    };
  }
} 