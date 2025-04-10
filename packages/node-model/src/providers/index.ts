import { env } from "@ai-bots/configs";
import { OpenAI } from 'openai';

// Model Provider Interface
export interface ModelProvider {
    callModel(systemPrompt: string, userPrompt: string, modelConfig?: any): Promise<any>;
}

// DeepSeek Model Provider Implementation
export class DeepSeekProvider implements ModelProvider {
    private client: OpenAI;

    constructor() {
        const apiKey = env.DEEPSEEK_API_KEY || 'dummy-key';
        this.client = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: apiKey
        });
    }

    async callModel(systemPrompt: string, userPrompt: string, modelConfig?: any): Promise<any> {
        const apiKey = env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            throw new Error("DEEPSEEK_API_KEY environment variable is not set.");
        }

        try {
            console.log("Calling DeepSeek API with model:", modelConfig?.model || "deepseek-chat");
            
            // 使用 OpenAI SDK 调用 DeepSeek API
            const completion = await this.client.chat.completions.create({
                model: modelConfig?.model || "deepseek-chat",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ]
            });
            return {
                id: completion.id,
                user_prompt: userPrompt,
                system_prompt: systemPrompt,
                object: completion.object,
                created: completion.created,
                model: completion.model,
                choices: completion.choices.map(choice => ({
                    index: choice.index,
                    message: {
                        role: choice.message.role,
                        content: choice.message.content
                    },
                    finish_reason: choice.finish_reason
                })),
                usage: completion.usage
            };
        } catch (error: any) {
            console.error("Error calling DeepSeek API:", error.message);
            throw new Error(`Failed to call DeepSeek API: ${error.message}`);
        }
    }
}

// OpenAI Model Provider Implementation
export class OpenAIProvider implements ModelProvider {
    private client: OpenAI;

    constructor() {
        const apiKey = env.OPENAI_API_KEY || 'dummy-key';
        this.client = new OpenAI({
            apiKey: apiKey
        });
    }

    async callModel(systemPrompt: string, userPrompt: string, modelConfig?: any): Promise<any> {
        const apiKey = env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY environment variable is not set.");
        }

        try {
            // 使用 OpenAI SDK 调用 OpenAI API
            const completion = await this.client.chat.completions.create({
                model: modelConfig?.model || "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ]
            });

            return {
                id: completion.id,
                object: completion.object,
                created: completion.created,
                model: completion.model,
                choices: completion.choices.map(choice => ({
                    index: choice.index,
                    message: {
                        role: choice.message.role,
                        content: choice.message.content
                    },
                    finish_reason: choice.finish_reason
                })),
                usage: completion.usage
            };
        } catch (error: any) {
            console.error("Error calling OpenAI API:", error.message);
            throw new Error(`Failed to call OpenAI API: ${error.message}`);
        }
    }
}

// Model Provider Factory
export class ModelProviderFactory {
    static getProvider(modelType: string): ModelProvider {
        switch (modelType.toLowerCase()) {
            case 'deepseek':
                return new DeepSeekProvider();
            case 'openai':
                return new OpenAIProvider();
            default:
                throw new Error(`Unsupported model provider: ${modelType}`);
        }
    }
} 