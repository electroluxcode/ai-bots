import { env } from "@ai-bots/configs";
import { 
    FlowDefinition, 
    NodeBase, 
    FlowContext, 
    NodeResult,
    StartNode,
    EndNode
} from "@ai-bots/types";
import { StartNodeExecutor, EndNodeExecutor, NodeExecutor } from "@ai-bots/node-base";
import { LLMNodeExecutor } from "@ai-bots/node-model";
import * as fs from 'fs';
import * as path from 'path';

// Load the flow definition from flow.json
// es语法
const flowFilePath = path.join(process.cwd(), 'flow.json'); // Use path.join for cross-platform compatibility
let flowDefinition: FlowDefinition = [];
try {
    const flowFileContent = fs.readFileSync(flowFilePath, 'utf-8');
    flowDefinition = JSON.parse(flowFileContent);
} catch (error: any) {
    console.error(`Error reading or parsing flow.json at ${flowFilePath}:`, error.message);
    process.exit(1); // Exit if flow definition is missing or invalid
}


// --- Flow Execution Logic ---

// Type guard to check if a node is a StartNode
function isStartNode(node: NodeBase): node is StartNode {
    return node.type === 'node-start';
}

function isEndNode(node: NodeBase): node is EndNode {
    return node.type === 'node-end';
}

// Mapping from node type to executor class
const nodeExecutorRegistry: { [key: string]: typeof NodeExecutor } = {
    'node-start': StartNodeExecutor,
    'node-end': EndNodeExecutor,
    'node-model': LLMNodeExecutor,
    // Add other node types here as they are implemented
};

// Function to get the executor for a given node
function getExecutor(node: NodeBase): NodeExecutor {
    const ExecutorClass = nodeExecutorRegistry[node.type];
    if (!ExecutorClass) {
        throw new Error(`No executor found for node type: ${node.type}`);
    }
    // Cast node to any to satisfy constructor constraints - assumes correct structure based on type
    // A more robust solution might involve type guards for each node type
    // @ts-ignore
    return new ExecutorClass(node as any); 
}


// Main function to execute the flow
async function executeFlow(flow: FlowDefinition, initialInput: NodeResult): Promise<NodeResult> {

    // step1: find the start node
    const startNodeDef = flow.find(isStartNode);
    if (!startNodeDef) {
        throw new Error("No start node found in the flow definition.");
    }

    // step2: create a map of all nodes
    const nodeMap: Map<string, NodeBase> = new Map(flow.map(node => [node.id, node]));

    const context: FlowContext = {}; // Stores results of executed nodes
    let currentNodeIds: string[] = [startNodeDef.id];
    let currentInput: NodeResult = initialInput; // Input for the current node execution step

    // step3: execute the flow
    while (currentNodeIds.length > 0) {
        const nextNodeIds: string[] = [];
        let aggregatedResult: NodeResult = {}; // Used if multiple nodes run in parallel (simple aggregation here)

        // Execute all current nodes (in this simple linear case, it's just one)
        for (const nodeId of currentNodeIds) {
            const nodeDef = nodeMap.get(nodeId);
            if (!nodeDef) {
                console.warn(`Node definition not found for ID: ${nodeId}. Skipping.`);
                continue;
            }

            console.log(`--- Executing Node: ${nodeDef.name} (${nodeDef.id}) ---`);

            // step4: initialize the node class executor with flow.json
            const executor = getExecutor(nodeDef);

             // Validate input before execution (important for start node)
             // need?
             if (nodeDef.type === 'node-start' && !executor.validateInput(currentInput)) {
                throw new Error(`Start Node ${nodeDef.id}: Initial input validation failed.`);
            }
            
            try {
                // Pass the full context and the specific input for this execution step

                /**
                 * start node: store the input
                 * end node: format the output
                 * model node: execute the model
                 */
                const result = await executor.execute(context, currentInput);
                context[nodeId] = result; // Store result in context
                // input context
                aggregatedResult = { ...aggregatedResult, ...result }; // Simple merge for this step's output

                 // Get next nodes from the executor
                 const nextIds = executor.getNextNodes();
                 nextNodeIds.push(...nextIds);

                // If it's an end node, we can potentially stop if there are no parallel branches
                if (nodeDef.type === 'node-end') {
                     console.log(`--- Flow Finished at End Node: ${nodeDef.name} (${nodeDef.id}) ---`);
                     console.log("Final Output:", result);
                     return result; // Return the final result from the end node
                }

            } catch (error: any) {
                console.error(`Error executing node ${nodeId} (${nodeDef.name}):`, error.message);
                throw error; // Re-throw to stop the flow on error
            }
        }
        
        currentNodeIds = [...new Set(nextNodeIds)]; // Get unique next node IDs
        currentInput = aggregatedResult; // The output of this step becomes the input for the next
        if (currentNodeIds.length === 0) {
             console.log("--- Flow Finished: No more nodes to execute. ---");
        }
    }

    // Should ideally be returned by the End Node execution, but handle cases where flow ends unexpectedly
    console.warn("Flow finished without reaching an end node."); 
    // Find the last executed node's result (simple approach)

    const lastExecutedNodeId = flow.find(isEndNode)?.id;
    return lastExecutedNodeId ? context[lastExecutedNodeId] : {};
}


// --- Running the Example ---

// Example input based on prd.md
const exampleInput: NodeResult = {
    "api_role": "股票分析师",
    "api_content": "请问最近适合投资什么行业"
}

console.log("Starting AI Bot Flow Execution...");
console.log("Initial Input:", exampleInput);

// Ensure DEEPSEEK_API_KEY is set (needed by LLM node)
if (!env.DEEPSEEK_API_KEY) {
    console.warn("Warning: DEEPSEEK_API_KEY environment variable is not set. The LLM node will likely fail.");
    console.warn("Please create a .env file in the apps/mvp directory with DEEPSEEK_API_KEY=your_actual_key");
}


executeFlow(flowDefinition, exampleInput)
    .then(finalResult => {
        console.log("\n--- Flow Execution Completed ---");
        // The result is already logged by the End Node executor or the final step
        console.log("Final Flow Result:", finalResult); 
    })
    .catch(error => {
        console.error("\n--- Flow Execution Failed ---");
        console.error("Error:", error.message);
        process.exit(1);
    });


// Keep the default export if needed for other tooling, but the script now executes the flow directly.
// export default {}; 