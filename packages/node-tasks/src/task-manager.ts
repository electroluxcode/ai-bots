import { 
    FlowContext, 
    NodeResult, 
    NodeBase,
    ExecutionMode,
    FlowDefinition
} from "@ai-bots/types";
import { TaskExecutor, TaskExecutionResult } from "./task-executor.js";
import { executeFlow } from "@ai-bots/node-workflow";

export interface TaskExecutionSummary {
    execution_mode: ExecutionMode;
    total_workflows: number;
    successful_workflows: number;
    failed_workflows: number;
    results: TaskExecutionResult[];
    total_execution_time_ms: number;
}

export class TaskManager {
    private executors: TaskExecutor[] = [];

    constructor(
        private workflows: NodeBase[],
        private executionMode: ExecutionMode,
        private timeout_ms?: number,
        private max_retries: number = 0,
        private retry_delay_ms: number = 1000
    ) {
        // Create task executors for each workflow node
        this.executors = workflows.map(workflow => 
            new TaskExecutor(workflow, timeout_ms, max_retries, retry_delay_ms)
        );
    }

    /**
     * Execute all workflows according to the specified execution mode
     */
    async executeAll(context: FlowContext, input: NodeResult): Promise<TaskExecutionSummary> {
        const startTime = Date.now();
        let results: TaskExecutionResult[] = [];

        // Execute in parallel or serial based on execution mode
        if (this.executionMode === 'parallel') {
            results = await this.executeParallel(context, input);
        } else {
            results = await this.executeSerial(context, input);
        }

        // Calculate summary
        const successful = results.filter(r => r.success).length;
        const failed = results.length - successful;

        return {
            execution_mode: this.executionMode,
            total_workflows: this.workflows.length,
            successful_workflows: successful,
            failed_workflows: failed,
            results,
            total_execution_time_ms: Date.now() - startTime
        };
    }

    /**
     * Execute a single workflow directly
     * This is a simplified approach for direct workflow execution
     */
    async executeSingleWorkflow(workflowDef: FlowDefinition, input: any): Promise<NodeResult> {
        const startTime = Date.now();
        
        try {
            // Using executeFlow directly from node-workflow
            const result = await executeFlow(workflowDef, input);
            
            return {
                ...result,
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

    /**
     * Execute workflows in parallel
     */
    private async executeParallel(context: FlowContext, input: NodeResult): Promise<TaskExecutionResult[]> {
        // Execute all workflows concurrently
        const execPromises = this.executors.map(executor => 
            executor.execute(context, input)
        );

        // If timeout is specified, wrap promises with timeout
        if (this.timeout_ms) {
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error(`Task execution timed out after ${this.timeout_ms}ms`)), this.timeout_ms);
            });

            // Create promises that race against the timeout
            const timeoutWrappedPromises = execPromises.map(promise => 
                Promise.race([promise, timeoutPromise])
                    .catch(error => ({
                        success: false,
                        workflow_id: 'unknown', // Will be overwritten in catch block if possible
                        error: error instanceof Error ? error : new Error(String(error))
                    }))
            );

            return Promise.all(timeoutWrappedPromises);
        }

        // If no timeout, just execute all promises
        return Promise.all(execPromises);
    }

    /**
     * Execute workflows serially, one after another
     */
    private async executeSerial(context: FlowContext, input: NodeResult): Promise<TaskExecutionResult[]> {
        const results: TaskExecutionResult[] = [];
        
        for (const executor of this.executors) {
            try {
                const result = await executor.execute(context, input);
                results.push(result);
                
                // Update the context with the result for potential use by subsequent workflows
                if (result.success && result.result) {
                    const workflowId = this.workflows.find(w => w.id === result.workflow_id)?.id;
                    if (workflowId) {
                        context[workflowId] = result.result;
                    }
                }
            } catch (error) {
                // This shouldn't happen as TaskExecutor.execute() should handle errors,
                // but added as a safety measure
                const workflowId = executor['workflowNode']?.id || 'unknown';
                results.push({
                    success: false,
                    workflow_id: workflowId,
                    error: error instanceof Error ? error : new Error(String(error))
                });
            }
        }
        
        return results;
    }
    
    // Add custom toString method
    toString() {
        return `TaskManager(${this.executionMode}, workflows: ${this.workflows.length})`;
    }
    
    // Add custom inspect method
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.toString();
    }
} 