import { 
    TaskNode, 
    FlowContext, 
    NodeResult,
    NodeId,
    FlowDefinition
} from "@ai-bots/types";
import { NodeExecutor } from "@ai-bots/node-base";
import { TaskManager } from "./task-manager.js";
import { TaskScheduler } from "./scheduler.js";
import { executeFlow } from "@ai-bots/node-workflow";

/**
 * core: 
 * TaskNodeExecutor implements a node that can manage workflows
 * It supports both immediate and scheduled task execution
 */
export class TaskNodeExecutor extends NodeExecutor {
    private scheduler: TaskScheduler;
    private scheduledTaskId?: string;

    constructor(protected node: TaskNode) {
        super(node);
        this.scheduler = new TaskScheduler();
    }

    /**
     * Execute the task node, either immediately or as a scheduled task
     */
    async execute(context: FlowContext, input: NodeResult): Promise<NodeResult> {
        console.log(`Executing Task Node: ${this.node.id}`);
        
        // Ensure we have input data
        if (!input) {
            throw new Error(`Task Node ${this.node.id}: Input validation failed. Missing input.`);
        }

        // Check if this is a scheduled task
        if (this.node.param.trigger_type === 'scheduled') {
            return this.setupScheduledTask(context, input);
        } else {
            // For manual trigger, execute workflows immediately
            return this.executeWorkflows(context, input);
        }
    }

    /**
     * Set up a scheduled task
     */
    private async setupScheduledTask(context: FlowContext, input: NodeResult): Promise<NodeResult> {
        if (!this.node.param.schedule?.cron_expression) {
            throw new Error('Scheduled task requires a cron expression');
        }

        // Remove any existing scheduled task
        if (this.scheduledTaskId) {
            this.scheduler.deleteTask(this.scheduledTaskId);
        }

        // Create a new scheduled task
        this.scheduledTaskId = `task-${this.node.id}-${Date.now()}`;
        
        const task = this.scheduler.scheduleTask(
            this.scheduledTaskId,
            this.node.param.schedule,
            async () => {
                try {
                    // Execute the workflows when the schedule triggers
                    const result = await this.executeWorkflows(context, input);
                    
                    // Here you could store the result or trigger notifications
                    console.log(`Scheduled task ${this.scheduledTaskId} completed:`, result);
                } catch (error) {
                    console.error(`Scheduled task ${this.scheduledTaskId} failed:`, error);
                }
            }
        );
        
        // Start the scheduled task
        this.scheduler.startTask(this.scheduledTaskId);
        
        // Return information about the scheduled task
        return {
            task_id: this.scheduledTaskId,
            schedule: this.node.param.schedule,
            status: 'scheduled',
            next_run: task.next_run?.toISOString(),
            message: `Task scheduled with cron expression: ${this.node.param.schedule.cron_expression}`
        };
    }

    /**
     * Execute workflows using the node-workflow executeFlow function
     * Simplified to directly use the input data without mapping
     */
    private async executeWorkflows(context: FlowContext, input: any): Promise<NodeResult> {
        const startTime = Date.now();
        
        try {
            // Ensure workflows parameter is a valid FlowDefinition
            const workflows = this.node.param.workflows;
            if (!workflows || !Array.isArray(workflows) || workflows.length === 0) {
                throw new Error("Invalid workflow definition");
            }

            // Directly use executeFlow from @ai-bots/node-workflow
            // This matches the approach used in the apps/mvp/src/index.ts file
            const result = await executeFlow(workflows as FlowDefinition, input);
            
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

    /**
     * Cancel a scheduled task
     */
    cancelScheduledTask(): boolean {
        if (!this.scheduledTaskId) {
            return false;
        }
        
        return this.scheduler.deleteTask(this.scheduledTaskId);
    }

    /**
     * Run a scheduled task immediately
     */
    async runScheduledTaskNow(context: FlowContext, input: NodeResult): Promise<NodeResult> {
        if (!this.scheduledTaskId) {
            throw new Error('No scheduled task exists for this node');
        }
        
        await this.scheduler.runTaskNow(this.scheduledTaskId);
        return {
            task_id: this.scheduledTaskId,
            status: 'executed',
            message: 'Scheduled task executed immediately'
        };
    }
    
    // Add custom toString method to avoid [nodejs.util.inspect.custom] error
    toString() {
        return `TaskNodeExecutor(${this.node.id}: ${this.node.name})`;
    }
    
    // Add custom inspect method
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.toString();
    }
} 