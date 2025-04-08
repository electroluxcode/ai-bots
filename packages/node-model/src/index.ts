import { 
    LLMNode, 
    FlowContext, 
    NodeResult, 
    FormInput,
    FieldInput,
    ResponseOutput
} from "@ai-bots/types";
import { NodeExecutor } from "@ai-bots/node-base";
import { resolveInputValue } from "@ai-bots/utils";
import { ModelProvider, ModelProviderFactory } from "./providers/index.js";

// Export provider types
export * from "./providers/index.js";

// LLM Node Implementation
export class LLMNodeExecutor extends NodeExecutor {
    constructor(protected node: LLMNode) {
        super(node);
    }

    async execute(context: FlowContext, input: NodeResult): Promise<NodeResult> {
        console.log(`Executing LLM Node: ${this.node.id}`);
        if (!this.validateInput(input)) {
            throw new Error(`LLM Node ${this.node.id}: Input validation failed.`);
        }

        // Core:Construct System Prompt
        let systemPrompt = "";
        // resolveInputValue(item, context).toString()
        if (this.node.param.system_prompt && this.node.param.system_prompt.length > 0) {
             systemPrompt = this.node.param.system_prompt
                .map(item => resolveInputValue(item, { ...context, [this.node.id]: input })) // Add current input to context for resolution
                .join('');
        } else {
            console.warn(`LLM Node ${this.node.id}: No system prompt defined.`);
        }

        // Core:Construct User Prompt (Content)
        let userPrompt = "";
        if (this.node.param.content && this.node.param.content.length > 0) {
            userPrompt = this.node.param.content
               .map(item => resolveInputValue(item, { ...context, [this.node.id]: input })) // Use combined context
               .join('');
        } 
        
        console.log(`LLM Node ${this.node.id} - System Prompt:`, systemPrompt);
        console.log(`LLM Node ${this.node.id} - User Prompt:`, userPrompt);

        // Get the model provider based on configuration
        // Use type assertion to handle the provider property that was added to LLMNodeParams
        const params = this.node.param as any;
        const providerType = params.provider || 'deepseek'; // Default to DeepSeek if not specified

        // core:
        const provider = ModelProviderFactory.getProvider(providerType);
        
        // Call the LLM API with the model configuration
        const modelConfig = {
            model: this.node.param.modal || undefined, // Pass the model name if specified
            // Additional model-specific configuration can be added here
        };
        
        const llmResponse = await provider.callModel(systemPrompt, userPrompt, modelConfig);

        // Structure the output based on the node's output definition
        const outputResult: NodeResult = {};
        const outputDefinition = this.node.output?.content?.[0] as ResponseOutput | undefined;

        if (outputDefinition && outputDefinition.type === 'response') {
            outputResult[outputDefinition.key] = llmResponse;
        } else {
            console.warn(`LLM Node ${this.node.id}: Output definition missing or not of type 'response'. Using default key 'response'.`);
            outputResult['response'] = llmResponse; // Default output key
        }

        console.log(`LLM Node ${this.node.id} output:`, outputResult);
        return outputResult;
    }
} 