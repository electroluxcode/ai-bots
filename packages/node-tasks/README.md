# @ai-bots/node-tasks

Task management node for AI-Bots workflow system, providing task scheduling and workflow execution capabilities.

## Features

- ✅ Direct workflow execution without complex mapping
- ✅ Scheduled task execution with cron expressions
- ✅ Parallel and serial workflow execution modes
- ✅ Retry logic and timeout handling
- ✅ Simplified API that matches apps/mvp style

## Installation

```bash
# Using npm
npm install @ai-bots/node-tasks

# Using yarn
yarn add @ai-bots/node-tasks

# Using pnpm
pnpm add @ai-bots/node-tasks
```

## Usage

### Direct Workflow Execution

The simplest way to execute a workflow is to use the `executeFlow` or `executeWorkflow` functions:

```typescript
import { executeFlow, executeWorkflow } from '@ai-bots/node-tasks';
import * as fs from 'fs';
import * as path from 'path';

// Example input data
const input = {
  api_role: "股票分析师",
  api_content: "请问最近适合投资什么行业"
};

// Load workflow definition from a file
const flowFilePath = path.join(process.cwd(), 'flow.json');
const flowDefinition = JSON.parse(fs.readFileSync(flowFilePath, 'utf-8'));

// Method 1: Using executeFlow (direct re-export from node-workflow)
executeFlow(flowDefinition, input)
  .then(result => {
    console.log('Flow execution completed:');
    console.log('Final result:', result);
  })
  .catch(error => {
    console.error('Flow execution failed:', error);
  });

// Method 2: Using executeWorkflow (with additional metadata)
executeWorkflow(flowDefinition, input)
  .then(result => {
    console.log('Workflow execution completed:');
    console.log(`Execution time: ${result.execution_time_ms}ms`);
    console.log('Status:', result.status);
    console.log('Final result:', result);
  })
  .catch(error => {
    console.error('Workflow execution failed:', error);
  });
```

### Using TaskManager

For more advanced use cases, you can use the TaskManager:

```typescript
import { TaskManager } from '@ai-bots/node-tasks';
import * as fs from 'fs';
import * as path from 'path';

// Load workflow definition
const flowFilePath = path.join(process.cwd(), 'flow.json');
const flowDefinition = JSON.parse(fs.readFileSync(flowFilePath, 'utf-8'));

// Example input data
const input = {
  api_role: "股票分析师",
  api_content: "请问最近适合投资什么行业"
};

// Create empty context for workflow execution
const context = {};

// Method 1: Execute a single workflow
const taskManager = new TaskManager([], 'serial');
taskManager.executeSingleWorkflow(flowDefinition, input)
  .then(result => {
    console.log('Task execution completed:');
    console.log('Final result:', result);
  })
  .catch(error => {
    console.error('Task execution failed:', error);
  });

// Method 2: Execute multiple workflows
// Define workflow nodes for execution
const workflowNodes = [
  {
    id: 'workflow1',
    name: 'First Workflow',
    type: 'node-workflow',
    param: {
      workflows: flowDefinition
    }
  },
  {
    id: 'workflow2',
    name: 'Second Workflow',
    type: 'node-workflow',
    param: {
      workflows: flowDefinition
    }
  }
];

// Create TaskManager for parallel execution
const parallelManager = new TaskManager(workflowNodes, 'parallel');

// Execute all workflows in parallel
parallelManager.executeAll(context, input)
  .then(summary => {
    console.log('Parallel execution completed:');
    console.log(`Total workflows: ${summary.total_workflows}`);
    console.log(`Successful: ${summary.successful_workflows}`);
    console.log(`Failed: ${summary.failed_workflows}`);
    console.log(`Total execution time: ${summary.total_execution_time_ms}ms`);
    console.log('Results:', summary.results);
  })
  .catch(error => {
    console.error('Parallel execution failed:', error);
  });
```

### Scheduled Tasks

You can also schedule tasks to run at specific times using cron expressions:

```typescript
import { TaskNodeExecutor } from '@ai-bots/node-tasks';
import * as fs from 'fs';
import * as path from 'path';

// Load workflow definition
const flowFilePath = path.join(process.cwd(), 'flow.json');
const flowDefinition = JSON.parse(fs.readFileSync(flowFilePath, 'utf-8'));

// Example input data
const input = {
  api_role: "股票分析师",
  api_content: "请问最近适合投资什么行业"
};

// Create empty context for workflow execution
const context = {};

// Create a task node with scheduled execution
const taskNode = {
  id: 'scheduled-task',
  name: 'Daily Stock Analysis',
  type: 'node-task',
  param: {
    trigger_type: 'scheduled',
    workflows: flowDefinition,
    schedule: {
      cron_expression: '0 9 * * 1-5', // Run at 9:00 AM Monday through Friday
      timezone: 'Asia/Shanghai'
    }
  }
};

// Create and execute the task node
const taskExecutor = new TaskNodeExecutor(taskNode);
taskExecutor.execute(context, input)
  .then(result => {
    console.log('Scheduled task setup completed:');
    console.log('Next run:', result.next_run);
    console.log('Task ID:', result.task_id);
  })
  .catch(error => {
    console.error('Scheduled task setup failed:', error);
  });
```

## API Reference

### Functions

- `executeFlow(workflow, input)`: Direct re-export of the executeFlow function from @ai-bots/node-workflow
- `executeWorkflow(workflow, input)`: Simplified wrapper around executeFlow with additional metadata

### Classes

- `TaskManager`: Manages multiple workflows execution in parallel or serial mode
- `TaskNodeExecutor`: Implements a node that can manage workflows with scheduling capabilities
- `TaskScheduler`: `TaskNodeExecutor` uses `TaskScheduler` to handle scheduling of tasks using cron expressions

## License

MIT 