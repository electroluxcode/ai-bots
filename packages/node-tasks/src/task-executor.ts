import { 
    FlowContext, 
    NodeResult, 
    NodeBase
} from "@ai-bots/types";
import { executeFlow } from "@ai-bots/node-workflow";

// 创建一个 Promise 包装的 setTimeout
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export interface TaskExecutionResult {
    success: boolean;
    workflow_id: string;
    result?: NodeResult;
    error?: Error;
    execution_time_ms?: number;
}

/**
 * Execute a specific task in a workflow
 * This executes a single node in the workflow and handles retries and timeouts
 */
export class TaskExecutor {
    constructor(
        private workflowNode: NodeBase,
        private timeout_ms?: number,
        private max_retries: number = 0,
        private retry_delay_ms: number = 1000
    ) {}

    /**
     * Execute the workflow task with the given input
     * @param context The global context for execution
     * @param input The input data for the workflow
     * @returns Promise<TaskExecutionResult>
     */
    async execute(context: FlowContext, input: NodeResult): Promise<TaskExecutionResult> {
        const startTime = Date.now();
        let retries = 0;
        let lastError: Error | undefined;

        // Validate input before processing
        if (!this.validateInput(input)) {
            return {
                success: false,
                workflow_id: this.workflowNode.id,
                error: new Error(`Input validation failed for workflow ${this.workflowNode.id}`),
                execution_time_ms: Date.now() - startTime
            };
        }
        
        while (retries <= this.max_retries) {
            try {
                // Execute the workflow with timeout if specified
                let workflowResult: NodeResult;
                
                if (this.timeout_ms) {
                    const timeoutPromise = new Promise<never>((_, reject) => {
                        setTimeout(() => reject(new Error(`Workflow execution timed out after ${this.timeout_ms}ms`)), this.timeout_ms);
                    });
                    
                    workflowResult = await Promise.race([
                        this.executeWorkflow(context, input),
                        timeoutPromise
                    ]);
                } else {
                    workflowResult = await this.executeWorkflow(context, input);
                }
                
                return {
                    success: true,
                    workflow_id: this.workflowNode.id,
                    result: workflowResult,
                    execution_time_ms: Date.now() - startTime
                };
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                retries++;
                
                if (retries <= this.max_retries) {
                    // Wait before retrying
                    await sleep(this.retry_delay_ms);
                }
            }
        }

        return {
            success: false,
            workflow_id: this.workflowNode.id,
            error: lastError,
            execution_time_ms: Date.now() - startTime
        };
    }

    /**
     * Validate the input data before execution
     * @param input The input data to validate
     * @returns boolean indicating if the input is valid
     */
    validateInput(input: NodeResult): boolean {
        // Basic validation - ensure input exists
        if (!input) {
            return false;
        }

        return true;
    }

    /**
     * Execute the actual workflow using executeFlow from node-workflow
     */
    private async executeWorkflow(context: FlowContext, input: NodeResult): Promise<NodeResult> {
        console.log(`Executing workflow ${this.workflowNode.id}: ${this.workflowNode.name}`);
        console.log(`  Input data: ${JSON.stringify(input)}`);
        
        // If the node has a workflow definition, use it
        if (this.workflowNode.param?.workflows) {
            return executeFlow(this.workflowNode.param.workflows, input);
        }
        
        // If no workflow is defined, return a simple result
        return {
            result: `Result from ${this.workflowNode.name}`,
            timestamp: new Date().toISOString()
        };
    }
    
    // 添加自定义的 toString 方法以避免 [nodejs.util.inspect.custom] 错误
    toString() {
        return `TaskExecutor(${this.workflowNode.id}: ${this.workflowNode.name})`;
    }
    
    // 添加自定义的 inspect 方法
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.toString();
    }
} 