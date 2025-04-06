import { ScheduleConfig } from '@ai-bots/types';
import * as schedule from 'node-schedule';

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
    job?: schedule.Job;
    active: boolean;
    last_run?: Date;
    next_run?: Date;
}

export class TaskScheduler {
    private scheduledTasks: Map<string, ScheduledTask> = new Map();

    /**
     * Schedule a new task
     * @param id Unique identifier for the task
     * @param scheduleConfig Cron schedule configuration
     * @param task Function to execute when triggered
     * @returns The scheduled task object
     */
    scheduleTask(id: string, scheduleConfig: ScheduleConfig, task: () => Promise<void>): ScheduledTask {
        // Check if a task with this ID already exists
        if (this.scheduledTasks.has(id)) {
            throw new Error(`Task with ID ${id} already exists`);
        }

        const scheduledTask: ScheduledTask = {
            id,
            schedule: scheduleConfig,
            task,
            active: false
        };

        // Create the scheduled job with proper timezone handling
        const job = schedule.scheduleJob(
            {
                rule: scheduleConfig.cron_expression,
                start: new Date()  // 确保从当前时间开始调度
            },
            async () => {
                try {
                    scheduledTask.last_run = new Date();
                    this.updateNextRunTime(scheduledTask);
                    await task();
                } catch (error) {
                    console.error(`Error executing scheduled task ${id}:`, error);
                }
            }
        );

        if (!job) {
            throw new Error(`Failed to create scheduled job for task ${id}`);
        }

        // Store the job reference
        scheduledTask.job = job;
        
        // 设置初始的下一次执行时间
        this.updateNextRunTime(scheduledTask);
        
        // Add to our task registry
        this.scheduledTasks.set(id, scheduledTask);
        
        // 默认不启动任务
        job.cancel();
        
        return scheduledTask;
    }

    /**
     * Start a scheduled task
     * @param id The task ID
     * @returns boolean indicating success
     */
    startTask(id: string): boolean {
        const task = this.scheduledTasks.get(id);
        if (!task || !task.job) {
            return false;
        }

        // 使用完整的调度配置重新调度任务
        task.job.reschedule({
            rule: task.schedule.cron_expression,
            start: new Date()
        });
        
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
        if (!task || !task.job) {
            return false;
        }

        task.job.cancel();
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

        if (task.job) {
            task.job.cancel();
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
        if (!task.active || !task.job) {
            task.next_run = undefined;
            return;
        }

        try {
            // 创建一个新的调度器
            const tempJob = schedule.scheduleJob({
                rule: task.schedule.cron_expression,
                start: new Date(),  // 从当前时间开始计算
                end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)  // 计算未来一年内的下一次执行时间
            }, () => {});

            if (tempJob) {
                const nextRun = tempJob.nextInvocation();
                // 确保下一次执行时间是未来的时间
                if (nextRun && nextRun.getTime() > Date.now()) {
                    task.next_run = nextRun;
                    console.log(`任务 ${task.id} 的下一次执行时间:`, task.next_run);
                }
                tempJob.cancel();
            } else {
                console.error(`Failed to calculate next run time for task ${task.id}`);
                task.next_run = undefined;
            }
        } catch (error) {
            console.error(`Error calculating next run time for task ${task.id}:`, error);
            task.next_run = undefined;
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