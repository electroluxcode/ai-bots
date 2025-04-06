import { TaskNodeExecutor } from '@ai-bots/node-tasks';
import { env } from "@ai-bots/configs";
import { TaskNode } from "@ai-bots/types";

import * as fs from 'fs';
import * as path from 'path';
// --- Running the Example ---

// Example input based on prd.md
const exampleInput = {
    "api_role": "股票分析师",
    "api_content": "请问最近适合投资什么行业"
}

// Load the flow definition from flow.json
const flowFilePath = path.join(process.cwd(), 'base_schedule.json'); // Use path.join for cross-platform compatibility
let flowDefinition = [];
try {
    const flowFileContent = fs.readFileSync(flowFilePath, 'utf-8');
    flowDefinition = JSON.parse(flowFileContent);
} catch (error: any) {
    console.error(`Error reading or parsing flow.json at ${flowFilePath}:`, error.message);
    process.exit(1); // Exit if flow definition is missing or invalid
}

console.log("Starting AI Bot Flow Execution...");
console.log("Initial Input:", exampleInput);

// Ensure DEEPSEEK_API_KEY is set (needed by LLM node)
if (!env.DEEPSEEK_API_KEY) {
    console.warn("Warning: DEEPSEEK_API_KEY environment variable is not set. The LLM node will likely fail.");
    console.warn("Please create a .env file in the apps/mvp directory with DEEPSEEK_API_KEY=your_actual_key");
}


const taskNode: TaskNode = {
    id: 'scheduled-task',
    name: '每日任务',
    type: 'node-tasks',
    param: {
      trigger_type: 'scheduled',
      execution_mode: 'serial', // 添加执行模式
      workflows: flowDefinition,
      schedule: {
        // 秒、分、时、日、月、周几
        cron_expression: '5 * * * * *'
      }
    }
  };

  // 创建并执行任务节点 | 只有task节点有定时任务 | 暂时只支持单个workflow
  const taskExecutor = new TaskNodeExecutor(taskNode);
  taskExecutor.execute({}, {})
    .then(result => {
      console.log('定时任务设置完成:');
      console.log("目前时间:", new Date().toLocaleString());
      console.log('下次执行时间:', result.next_run);
      console.log('任务ID:', result.task_id);
      
      
      // 10秒后取消任务并退出
      // setTimeout(() => {
      //   console.log("\n取消定时任务并退出:");
      //   taskExecutor.cancelScheduledTask();
      //   console.log("示例执行完毕");
      // }, 10000);
    })
    .catch(error => {
      console.error('定时任务设置失败:', error);
    });


// Keep the default export if needed for other tooling, but the script now executes the flow directly.
// export default {}; 