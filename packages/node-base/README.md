# Node Base Package

This package provides the base functionality for all node types in the AI-Bots workflow system.

## Structure

The package is organized into the following files:

- `base.ts` - Contains the abstract `NodeExecutor` class that all node executors extend
- `start-node.ts` - Contains the `StartNodeExecutor` implementation
- `end-node.ts` - Contains the `EndNodeExecutor` implementation
- `index.ts` - Exports all node types from the package

## Core Components

### NodeExecutor

The abstract base class that all node executors extend. It provides:

- Input validation
- Node execution interface
- Flow control methods (getting next nodes)

### StartNodeExecutor

A specialized executor for start nodes that:

- Validates input against the node's input definition
- Passes the initial input to the workflow

### EndNodeExecutor

A specialized executor for end nodes that:

- Constructs the final output based on the node's output definition
- Resolves references to values from the execution context
- Terminates the workflow by returning no next nodes

## Usage

```typescript
import { NodeExecutor, StartNodeExecutor, EndNodeExecutor } from "@ai-bots/node-base";

// Using a start node
const startNode = new StartNodeExecutor(myStartNodeDefinition);
const result = await startNode.execute(context, input);

// Using an end node
const endNode = new EndNodeExecutor(myEndNodeDefinition);
const finalResult = await endNode.execute(context, input);

// Creating a custom node type
class MyCustomNodeExecutor extends NodeExecutor {
  constructor(protected node: MyCustomNode) {
    super(node);
  }

  async execute(context, input) {
    // Custom implementation
    return result;
  }
}
```

## Extending

To create a new node type:

1. Create a new file for your node type (e.g., `my-custom-node.ts`)
2. Extend the `NodeExecutor` abstract class
3. Implement the `execute` method
4. Export your new node class
5. If needed, add it to the exports in `index.ts` 