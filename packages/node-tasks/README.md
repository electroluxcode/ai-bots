## TaskManager: 单/多工作流任务

1. 串行并行
`Parallel`: 并行的原理是 `Promise.all`
`Serial`: 串行的原理是 `for of` + `await`

2. 代码组织

task-manager->task-executor->executeWorkflow


## TaskNodeExecutor: 定时器类型的任务

任务执行器, 执行单个工作流，支持scheduled task execution

1. 原理

```typescript
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

```


