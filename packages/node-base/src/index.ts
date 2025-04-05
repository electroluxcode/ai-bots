import { 
    StartNode, 
    EndNode, 
    FlowContext, 
    NodeResult, 
    NodeId, 
    NodeBase, 
    FieldOutput,
    FieldInput,
    FormInput
} from "@ai-bots/types";
import { getValueFromContext } from "@ai-bots/utils"; // Corrected import path

// Abstract class for node execution logic
export abstract class NodeExecutor {
    constructor(protected node: NodeBase) {}

    // Method to validate input against the node definition
    public validateInput(input: NodeResult): boolean {
        // Basic validation: check if required keys are present
        if (this.node.input?.content) {
            for (const item of this.node.input.content) {
                if (item.type === 'key' && !(item.value in input)) {
                    console.error(`Node ${this.node.id}: Missing required input key '${item.value}'`);
                    return false;
                }
            }
        }
        return true;
    }

    // Abstract method to be implemented by specific node types
    abstract execute(context: FlowContext, input: NodeResult): Promise<NodeResult>;

    getNextNodes(): NodeId[] {
        return this.node.next_nodes || [];
    }
}

// Start Node Implementation
export class StartNodeExecutor extends NodeExecutor {
    constructor(protected node: StartNode) {
        super(node);
    }

    async execute(context: FlowContext, input: NodeResult): Promise<NodeResult> {
        console.log(`Executing Start Node: ${this.node.id}`);
        if (!this.validateInput(input)) {
            throw new Error(`Start Node ${this.node.id}: Input validation failed.`);
        }
        
        // Start node simply passes the initial input through
        // It primarily defines the expected input structure
        return { ...input }; // Return a copy to avoid mutation
    }
}

// End Node Implementation
export class EndNodeExecutor extends NodeExecutor {
    constructor(protected node: EndNode) {
        super(node);
    }

    async execute(context: FlowContext, input: NodeResult): Promise<NodeResult> {
        console.log(`Executing End Node: ${this.node.id}`);
        // The End node's primary job is to format the final output 
        // based on its `output` definition.
        const finalOutput: NodeResult = {};

        if (!this.node.output || this.node.output.type !== 'form' || !this.node.output.content) {
            console.warn(`End Node ${this.node.id}: No output format defined. Returning raw input.`);
            return { ...input }; // Return input if no specific output defined
        }

        for (const item of this.node.output.content) {
            if (item.type === 'field') {
                const fieldOutput = item as FieldOutput;
                try {
                    // value here is like "nodeId.key"
                    const value = getValueFromContext(context, fieldOutput.value); 
                    finalOutput[fieldOutput.key] = value;
                } catch (error) {
                    console.error(`End Node ${this.node.id}: Error resolving value for key '${fieldOutput.key}' from '${fieldOutput.value}':`, error);
                    // Decide how to handle missing values: throw error, use null, etc.
                    finalOutput[fieldOutput.key] = null; 
                }
            } else if (item.type === 'input') {
                 const formInput = item as FormInput;
                 finalOutput[formInput.value.toString()] = formInput.value; // Include constant values if needed
            } else {
                console.warn(`End Node ${this.node.id}: Unsupported output item type '${item.type}'`);
            }
        }

        console.log(`End Node ${this.node.id} final output:`, finalOutput);
        return finalOutput;
    }

    // Override: End node has no next nodes
    getNextNodes(): NodeId[] {
        return [];
    }
} 