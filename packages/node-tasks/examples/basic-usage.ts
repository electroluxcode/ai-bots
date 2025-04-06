import { executeFlow, executeWorkflow, TaskManager, TaskNodeExecutor } from '../src/index.js';
import type { TaskNode } from '@ai-bots/types';

// 添加环境变量模拟 API 密钥（在实际使用中应该通过 .env 文件或环境变量设置）
// process.env.DEEPSEEK_API_KEY = 'sk-mock-key-for-testing';

// 定义示例工作流
const flowDefinition = [
  {
      "id": "开始节点-123",
      "version": "v1",
      "type": "node-start",
      "name": "开始节点",
      "next_nodes": ["大模型节点-456"],
      "param":{
          "trigger": "api"
      }
  },
  {
      "id": "大模型节点-456",
      "version": "v1",
      "type": "node-model",
      "name": "大模型调用节点",
      "next_nodes": ["结束节点-789"],
      "param":{
          "modal": "deepseek-chat",
          "provider": "deepseek", // 明确指定使用 DeepSeek 提供商
          "knowledge_config": {
              "max_recall_num": 10,
              "min_recall_score": 0.5,
              "knowledge_id": null
          },
          "content": [{
              "type": "input",
              "value": "请问最近适合投资什么行业"
          }],
          "system_prompt": [{
              "type": "input",
              "value": "你是一个股票分析师，请根据用户的问题给出相应的回答"
          }]
      }
  },
  {
      "id": "结束节点-789",
      "version": "v1",
      "type": "node-end",
      "name": "结束节点",
      "next_nodes": []
  }
]; 

// 示例输入数据 - 直接使用没有映射的输入
const input = {
  api_role: "股票分析师",
  api_content: "请问最近适合投资什么行业"
};

import * as fs from 'fs';
// 创建空上下文用于工作流执行
const context = {};

// console.log("================ 示例1: 使用 executeFlow 直接执行工作流 ================");

// 示例1: 使用 executeFlow 直接执行工作流
// executeFlow(flowDefinition, input)
//   .then(result => {
//     console.log('工作流执行完成:');
//     console.log('最终结果:', result);
//     // 结果写入文件
//     fs.writeFileSync('result.json', JSON.stringify(result, null, 2));
//   })
//   .catch(error => {
//     console.error('工作流执行失败:', error);
//   });

// 等待示例1执行 
// setTimeout(() => {
//   console.log("\n================ 示例2: 使用 executeWorkflow 执行工作流 ================");
  
//   // 示例2: 使用 executeWorkflow 执行工作流（带额外元数据）
//   executeWorkflow(flowDefinition, input)
//     .then(result => {
//       console.log('工作流执行完成:');
//       console.log(`执行时间: ${result.execution_time_ms}ms`);
//       console.log('状态:', result.status);
//       console.log('最终结果:', result);
//     })
//     .catch(error => {
//       console.error('工作流执行失败:', error);
//     });
// }, 1000);

// // 等待示例2执行
// setTimeout(() => {
//   console.log("\n================ 示例3: 使用 TaskManager.executeSingleWorkflow 执行工作流 ================");
  
//   // 示例3: 使用 TaskManager 执行单个工作流
//   const taskManager = new TaskManager([], 'serial');
//   taskManager.executeSingleWorkflow(flowDefinition, input)
//     .then(result => {
//       console.log('任务执行完成:');
//       console.log('最终结果:', result);
//     })
//     .catch(error => {
//       console.error('任务执行失败:', error);
//     });
// }, 2000);


// setTimeout(() => {
//   console.log("\n================ 示例4: 使用 TaskManager.executeAll 执行多个工作流 ================");
  
//   // 示例4: 执行多个工作流
//   // 定义工作流节点
//   const workflowNodes = [
//     {
//       id: 'workflow1',
//       name: '工作流1',
//       type: 'node-workflow',
//       param: {
//         workflows: flowDefinition,
//         trigger_type: 'scheduled',
//         execution_mode: 'serial',
//         schedule: {
//           cron_expression: '*/5 * * * * *', // 每5秒执行一次，用于演示
//           timezone: 'Asia/Shanghai'
//         }
//       }
//     },
//     {
//       id: 'workflow2',
//       name: '工作流2',
//       type: 'node-workflow',
//       param: {
//         workflows: flowDefinition
//       }
//     }
//   ];

//   // 创建 TaskManager 用于并行执行
//   // serial/parallel
//   const parallelManager = new TaskManager(workflowNodes, 'serial');

//   // 并行执行所有工作流
//   parallelManager.executeAll(context, input)
//     .then(summary => {
//       console.log('并行执行完成:');
//       console.log(`总工作流数: ${summary.total_workflows}`);
//       console.log(`成功: ${summary.successful_workflows}`);
//       console.log(`失败: ${summary.failed_workflows}`);
//       console.log(`总执行时间: ${summary.total_execution_time_ms}ms`);
//       console.log('结果:', summary.results);
//     })
//     .catch(error => {
//       console.error('并行执行失败:', error);
//     });
// }, 3000);


setTimeout(() => {
  console.log("\n================ 示例5: 设置定时任务 ================");
  
  // 示例5: 创建定时任务
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
  taskExecutor.execute(context, input)
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
}, 4000);
