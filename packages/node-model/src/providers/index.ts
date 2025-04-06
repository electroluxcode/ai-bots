import { env } from "@ai-bots/configs";
import axios from 'axios';

// Model Provider Interface
export interface ModelProvider {
    callModel(systemPrompt: string, userPrompt: string, modelConfig?: any): Promise<any>;
}

// DeepSeek Model Provider Implementation
export class DeepSeekProvider implements ModelProvider {
    async callModel(systemPrompt: string, userPrompt: string, modelConfig?: any): Promise<any> {
        const apiKey = env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            throw new Error("DEEPSEEK_API_KEY environment variable is not set.");
        }

        try {
            const response = await axios.post(
                'https://api.deepseek.com/chat/completions',
                {
                    model: modelConfig?.model || "deepseek-chat", // Use configured model or default
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
            }
            throw new Error("DeepSeek API response was empty or malformed.");

        } catch (error: any) {
            console.error("Error calling DeepSeek API:", error.response?.data || error.message);
            throw new Error(`Failed to call DeepSeek API: ${error.message}`);
        }
    }
}

// OpenAI Model Provider Implementation
export class OpenAIProvider implements ModelProvider {
    async callModel(systemPrompt: string, userPrompt: string, modelConfig?: any): Promise<any> {
        const apiKey = env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY environment variable is not set.");
        }

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: modelConfig?.model || "gpt-3.5-turbo", // Use configured model or default
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
            }
            throw new Error("OpenAI API response was empty or malformed.");

        } catch (error: any) {
            console.error("Error calling OpenAI API:", error.response?.data || error.message);
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