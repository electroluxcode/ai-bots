# Changelog

## v1.0.0 (Initial Release)

### Features
- **TaskNodeExecutor**: Created main node executor for managing multiple workflows
- **TaskManager**: Implemented task manager for parallel and serial workflow execution
- **TaskExecutor**: Added individual workflow executor with retry mechanism
- **TaskScheduler**: Developed cron-based scheduler for scheduled task execution
- **Type Definitions**: Added TypeScript interfaces for task node in types package

### Core Capabilities
- **Workflow Execution Modes**:
  - Parallel workflow execution
  - Serial workflow execution with data passing
- **Trigger Types**:
  - Manual triggering
  - Cron-based scheduled execution
- **Advanced Features**:
  - Timeout handling for long-running workflows
  - Configurable retry mechanism for failed workflows
  - Input/output mapping between tasks and workflows
  - Detailed execution results and status tracking
  - Run scheduled tasks immediately option
  - Cancel scheduled tasks

### Documentation
- Added comprehensive README with usage examples
- Created example code demonstrating basic functionality 