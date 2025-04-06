# AI-Bots Model Node

This package provides LLM (Large Language Model) node implementation for AI-Bots workflow system. It supports multiple model providers and can be extended to support more in the future.

## Features

- Modular architecture with support for multiple LLM providers
- Currently supports:
  - DeepSeek
  - OpenAI
- Easy to extend to support additional LLM providers

## Architecture

The package follows a provider-based architecture:

- `ModelProvider` interface defines the contract for all model providers
- Concrete implementations like `DeepSeekProvider` and `OpenAIProvider` implement the interface
- `ModelProviderFactory` dynamically selects the appropriate provider based on configuration
- `LLMNodeExecutor` handles the node execution logic, prompt construction, and output handling

## Usage

### Node Configuration

Configure the LLM node in your workflow:

```json
{
  "id": "llm-node-1",
  "name": "DeepSeek Chat Node",
  "type": "node-model",
  "param": {
    "provider": "deepseek", // Provider: "deepseek" or "openai"
    "modal": "deepseek-chat", // Model name specific to the provider
    "system_prompt": [
      {
        "type": "input",
        "key": "system_instruction",
        "value": "You are a helpful AI assistant."
      }
    ],
    "content": [
      {
        "type": "input", 
        "key": "user_query",
        "value": "Hello, can you help me with something?"
      },
      {
        "type": "field",
        "value": "previous-node.response" // Reference to another node's output
      }
    ]
  },
  "output": {
    "type": "form",
    "content": [
      {
        "type": "response",
        "key": "response"
      }
    ]
  }
}
```

### Environment Variables

Ensure the appropriate API keys are set in your environment:

- For DeepSeek: `DEEPSEEK_API_KEY`
- For OpenAI: `OPENAI_API_KEY`

## Extending with New Providers

To add a new LLM provider:

1. Create a new provider class implementing the `ModelProvider` interface
2. Add the provider to the `ModelProviderFactory`

Example:

```typescript
// Implement new provider
export class AnthropicProvider implements ModelProvider {
    async callModel(systemPrompt: string, userPrompt: string, modelConfig?: any): Promise<any> {
        // Implementation for Anthropic Claude
    }
}

// Add to factory
// in ModelProviderFactory.getProvider():
switch (modelType.toLowerCase()) {
    case 'deepseek':
        return new DeepSeekProvider();
    case 'openai':
        return new OpenAIProvider();
    case 'anthropic':
        return new AnthropicProvider(); // Add new provider
    default:
        throw new Error(`Unsupported model provider: ${modelType}`);
}
```

## TypeScript Definitions

Update the `LLMNodeParams` interface in the types package when adding new provider-specific configurations. 