import { 
    LLMNode, 
    FlowContext, 
    NodeResult, 
    NodeBase, 
    FormInput,
    FieldInput,
    ResponseOutput
} from "@ai-bots/types";
import { NodeExecutor } from "@ai-bots/node-base"; // Assuming NodeExecutor is exported from node-base
import { env } from "@ai-bots/configs"; // For API Key
import { getValueFromContext, resolveInputValue } from "@ai-bots/utils";
import axios from 'axios';

// LLM Node Implementation
export class LLMNodeExecutor extends NodeExecutor {
    constructor(protected node: LLMNode) {
        super(node);
    }

    private async callDeepSeekAPI(systemPrompt: string, userPrompt: string): Promise<string> {
        const apiKey = env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            throw new Error("DEEPSEEK_API_KEY environment variable is not set.");
        }

        try {
            const response = await axios.post(
                'https://api.deepseek.com/chat/completions',
                {
                    model: this.node.param.modal || "deepseek-chat", // Use configured model or default
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    stream: false
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`
                    }
                }
            );

            if (response.data && response.data.choices && response.data.choices.length > 0) {
                return response.data;
                // .choices[0].message.content
            }
            throw new Error("DeepSeek API response was empty or malformed.");

        } catch (error: any) {
            console.error("Error calling DeepSeek API:", error.response?.data || error.message);
            throw new Error(`Failed to call DeepSeek API: ${error.message}`);
        }
    }

    private resolvePromptPart(item: FormInput | FieldInput, context: FlowContext): string {
        try {
             return resolveInputValue(item, context).toString();
        } catch (error: any) {
            console.error(`LLM Node ${this.node.id}: Error resolving prompt part ${JSON.stringify(item)}:`, error.message);
            return `[Error resolving value: ${item.value}]`; // Return error indicator in prompt
        }
    }

    async execute(context: FlowContext, input: NodeResult): Promise<NodeResult> {
        console.log(`Executing LLM Node: ${this.node.id}`);
        if (!this.validateInput(input)) { // Assuming validateInput is inherited and checks `node.input` if defined
            throw new Error(`LLM Node ${this.node.id}: Input validation failed.`);
        }

        // Core:Construct System Prompt
        let systemPrompt = "";
        if (this.node.param.system_prompt && this.node.param.system_prompt.length > 0) {
             systemPrompt = this.node.param.system_prompt
                .map(item => this.resolvePromptPart(item, { ...context, [this.node.id]: input })) // Add current input to context for resolution
                .join('');
        } else {
            console.warn(`LLM Node ${this.node.id}: No system prompt defined.`);
        }

        // Core:Construct User Prompt (Content)
        let userPrompt = "";
        if (this.node.param.content && this.node.param.content.length > 0) {
            userPrompt = this.node.param.content
               .map(item => this.resolvePromptPart(item, { ...context, [this.node.id]: input })) // Use combined context
               .join('');
        } 
        
        console.log(`LLM Node ${this.node.id} - System Prompt:`, systemPrompt);
        console.log(`LLM Node ${this.node.id} - User Prompt:`, userPrompt);

        // Call the LLM API
        const llmResponse = await this.callDeepSeekAPI(systemPrompt, userPrompt);

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