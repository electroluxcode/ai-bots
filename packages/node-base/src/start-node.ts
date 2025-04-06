import { 
    StartNode, 
    FlowContext, 
    NodeResult 
} from "@ai-bots/types";
import { NodeExecutor } from "./base.js";

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