import { ScheduleConfig } from '@ai-bots/types';
// Import node-cron as an ES module
import cron from 'node-cron';

// 为 cron 定义自定义类型
type CronScheduledTask = {
    start: () => void;
    stop: () => void;
};

// 为 cron 模块定义类型
interface CronModule {
    schedule: (
        expression: string, 
        task: () => void, 
        options?: { 
            scheduled?: boolean; 
            timezone?: string 
        }
    ) => CronScheduledTask;
    getTasks: () => Map<string, CronScheduledTask>;
}

export interface ScheduledTask {
    id: string;
    schedule: ScheduleConfig;
    task: () => Promise<void>;
    cronJob?: CronScheduledTask;
    active: boolean;
    last_run?: Date;
    next_run?: Date;
}

export class TaskScheduler {
    private scheduledTasks: Map<string, ScheduledTask> = new Map();

    /**
     * Schedule a new task
     * @param id Unique identifier for the task
     * @param schedule Cron schedule configuration
     * @param task Function to execute when triggered
     * @returns The scheduled task object
     */
    scheduleTask(id: string, schedule: ScheduleConfig, task: () => Promise<void>): ScheduledTask {
        // Check if a task with this ID already exists
        if (this.scheduledTasks.has(id)) {
            throw new Error(`Task with ID ${id} already exists`);
        }

        const scheduledTask: ScheduledTask = {
            id,
            schedule,
            task,
            active: false
        };

        // Create and start the cron job
        const cronJob = cron.schedule(
            schedule.cron_expression,
            async () => {
                try {
                    scheduledTask.last_run = new Date();
                    this.updateNextRunTime(scheduledTask);
                    await task();
                } catch (error) {
                    console.error(`Error executing scheduled task ${id}:`, error);
                }
            },
            {
                scheduled: false,
                timezone: schedule.timezone
            }
        );

        // Store the cron job reference
        scheduledTask.cronJob = cronJob;
        
        // Calculate next run time
        this.updateNextRunTime(scheduledTask);
        
        // Add to our task registry
        this.scheduledTasks.set(id, scheduledTask);
        
        return scheduledTask;
    }

    /**
     * Start a scheduled task
     * @param id The task ID
     * @returns boolean indicating success
     */
    startTask(id: string): boolean {
        const task = this.scheduledTasks.get(id);
        if (!task || !task.cronJob) {
            return false;
        }

        task.cronJob.start();
        task.active = true;
        this.updateNextRunTime(task);
        
        return true;
    }

    /**
     * Stop a scheduled task
     * @param id The task ID
     * @returns boolean indicating success
     */
    stopTask(id: string): boolean {
        const task = this.scheduledTasks.get(id);
        if (!task || !task.cronJob) {
            return false;
        }

        task.cronJob.stop();
        task.active = false;
        
        return true;
    }

    /**
     * Delete a scheduled task
     * @param id The task ID
     * @returns boolean indicating success
     */
    deleteTask(id: string): boolean {
        const task = this.scheduledTasks.get(id);
        if (!task) {
            return false;
        }

        if (task.cronJob) {
            task.cronJob.stop();
        }
        
        return this.scheduledTasks.delete(id);
    }

    /**
     * Get a list of all scheduled tasks
     */
    getAllTasks(): ScheduledTask[] {
        return Array.from(this.scheduledTasks.values());
    }

    /**
     * Get a specific task by ID
     */
    getTask(id: string): ScheduledTask | undefined {
        return this.scheduledTasks.get(id);
    }

    /**
     * Run a task immediately, regardless of its schedule
     * @param id The task ID
     * @returns Promise that resolves when the task completes
     */
    async runTaskNow(id: string): Promise<void> {
        const task = this.scheduledTasks.get(id);
        if (!task) {
            throw new Error(`Task with ID ${id} not found`);
        }

        task.last_run = new Date();
        await task.task();
    }

    /**
     * Update all tasks' next run time
     */
    updateAllNextRunTimes(): void {
        for (const task of this.scheduledTasks.values()) {
            this.updateNextRunTime(task);
        }
    }

    /**
     * Calculate and update the next run time for a task
     */
    private updateNextRunTime(task: ScheduledTask): void {
        if (!task.active) {
            task.next_run = undefined;
            return;
        }

        try {
            // 简化这部分逻辑，因为 getTasks() 可能会有问题
            // 使用简单的时间估算
            const nextDate = new Date();
            nextDate.setMinutes(nextDate.getMinutes() + 1); // A rough estimate
            task.next_run = nextDate;
        } catch (error) {
            console.error(`Error calculating next run time for task ${task.id}:`, error);
        }
    }
    
    // 添加自定义的 toString 方法以避免 [nodejs.util.inspect.custom] 错误 
    toString() {
        return `TaskScheduler(active tasks: ${Array.from(this.scheduledTasks.entries())
            .filter(([_, task]) => task.active)
            .length})`;
    }
    
    // 添加自定义的 inspect 方法
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.toString();
    }
} 