import { 
    NodeBase, 
    FlowContext, 
    NodeResult, 
    NodeId 
} from "@ai-bots/types";

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
    abstract execute(context: FlowContext, input: NodeResult, NodeDef: any): Promise<NodeResult>;

    getNextNodes(): NodeId[] {
        return this.node.next_nodes || [];
    }
} 