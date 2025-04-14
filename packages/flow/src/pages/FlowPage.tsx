import { useState, useCallback } from 'react';
import { FlowEditor } from '../components/Flow/FlowEditor';

// Sample workflow data from your provided JSON
const baseWorkflow = [
  {
    "id": "开始节点-123",
    "version": "v1",
    "type": "node-start",
    "name": "开始节点",
    "next_nodes": ["大模型节点-456"],
    "param": {
      "trigger": "api"
    }
  },
  {
    "id": "大模型节点-456",
    "version": "v1",
    "type": "node-model",
    "name": "大模型调用节点",
    "next_nodes": ["结束节点-789"],
    "param": {
      "provider": "deepseek",
      "modal": "deepseek-chat",
      "knowledge_config": {
        "max_recall_num": 10,
        "min_recall_score": 0.5,
        "knowledge_id": null
      },
      "content": [{
        "type": "input",
        "value": "请问最近适合投资什么行业"
      }],
      "system_prompt": [{
        "type": "input",
        "value": "你是一个股票分析师，请根据用户的问题给出相应的回答"
      }]
    }
  },
  {
    "id": "结束节点-789",
    "version": "v1",
    "type": "node-end",
    "name": "结束节点",
    "next_nodes": []
  }
] as const;

// Make sure the baseWorkflow is the correct type
interface FlowData {
  id: string;
  version: string;
  type: string;
  name: string;
  next_nodes: Array<string>;
  param: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export const FlowPage = (): JSX.Element => {
  const [flowData, setFlowData] = useState<Array<FlowData>>(baseWorkflow as unknown as Array<FlowData>);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const handleSaveFlow = (data: Array<FlowData>): void => {
    setFlowData(data);
    setJsonOutput(JSON.stringify(data, null, 2));
    console.log('Flow saved:', data);
  };

  const handleCopyJSON = useCallback(() => {
    const outputText = jsonOutput || JSON.stringify(flowData, null, 2);
    navigator.clipboard.writeText(outputText)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy JSON: ', err);
      });
  }, [jsonOutput, flowData]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1">
        <FlowEditor flowData={flowData} onSave={handleSaveFlow} />
      </div>
      
      <div className="bg-gray-800 text-green-400 text-sm">
        <div className="flex justify-between items-center p-2 border-b border-gray-700">
          <h3 className="text-white font-bold">JSON Output:</h3>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
            onClick={handleCopyJSON}
          >
            {copySuccess ? 
              <span>✓ 已复制</span> : 
              <span>复制 JSON</span>
            }
          </button>
        </div>
        <div className="p-4 overflow-auto" style={{ height: '200px' }}>
          <pre>{jsonOutput || JSON.stringify(flowData, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}; 