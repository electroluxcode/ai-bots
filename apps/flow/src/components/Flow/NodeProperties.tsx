import { useCallback, useState, useEffect } from 'react';
import { Node } from 'reactflow';

interface NodePropertiesProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
}

export const NodeProperties = ({ selectedNode, onNodeUpdate }: NodePropertiesProps): JSX.Element => {
  const [nodeData, setNodeData] = useState<any>(null);

  useEffect(() => {
    if (selectedNode) {
      setNodeData({ ...selectedNode.data });
    } else {
      setNodeData(null);
    }
  }, [selectedNode]);

  const handleInputChange = useCallback(
    (key: any, value: string) => {
      if (!nodeData || !selectedNode) return;
      
      const updatedData = { ...nodeData };
      
      // Handle nested properties
      if (key.includes('.')) {
        const keys = key.split('.');
        let current = updatedData;
        
        // Navigate to the nested object
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (!(key in current)) {
            current[key] = {};
          }
          current = current[key] as Record<string, any>;
        }
        
        // Set the value
        current[keys[keys.length - 1]] = value;
      } else {
        updatedData[key] = value;
      }
      
      setNodeData(updatedData);
      onNodeUpdate(selectedNode.id, updatedData);
    },
    [nodeData, selectedNode, onNodeUpdate]
  );

  const renderStartNodeForm = () => (
    <>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">节点名称</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          value={nodeData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">触发方式</label>
        <select
          className="w-full p-2 border rounded-md"
          value={nodeData.param.trigger}
          onChange={(e) => handleInputChange('param.trigger', e.target.value)}
        >
          <option value="api">API</option>
          <option value="webhook">Webhook</option>
          <option value="schedule">Schedule</option>
        </select>
      </div>
    </>
  );

  const renderModelNodeForm = () => (
    <>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">节点名称</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          value={nodeData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">提供商</label>
        <select
          className="w-full p-2 border rounded-md"
          value={nodeData.param.provider}
          onChange={(e) => handleInputChange('param.provider', e.target.value)}
        >
          <option value="deepseek">DeepSeek</option>
          <option value="openai">OpenAI</option>
          <option value="huggingface">Hugging Face</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">模型</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          value={nodeData.param.modal}
          onChange={(e) => handleInputChange('param.modal', e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">系统提示词</label>
        <textarea
          className="w-full p-2 border rounded-md"
          rows={3}
          value={nodeData.param.system_prompt?.[0]?.value || ''}
          onChange={(e) => handleInputChange('param.system_prompt.0.value', e.target.value)}
        />
      </div>
    </>
  );

  const renderEndNodeForm = () => (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium text-gray-700">节点名称</label>
      <input
        type="text"
        className="w-full p-2 border rounded-md"
        value={nodeData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
      />
    </div>
  );

  const renderUtilsNodeForm = () => (
    <>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">节点名称</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          value={nodeData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">工具类型</label>
        <select
          className="w-full p-2 border rounded-md"
          value={nodeData.param?.type}
          onChange={(e) => handleInputChange('param.type', e.target.value)}
        >
          <option value="email">Email</option>
          <option value="http">HTTP</option>
          <option value="database">Database</option>
        </select>
      </div>
    </>
  );

  const renderCustomNodeForm = () => (
    <>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">节点名称</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          value={nodeData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">自定义字段</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          value={nodeData.param?.customField || ''}
          onChange={(e) => handleInputChange('param.customField', e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">其他属性</label>
        <select
          className="w-full p-2 border rounded-md"
          value={nodeData.param?.otherProperty || ''}
          onChange={(e) => handleInputChange('param.otherProperty', e.target.value)}
        >
          <option value="选项1">选项1</option>
          <option value="选项2">选项2</option>
          <option value="选项3">选项3</option>
        </select>
      </div>
    </>
  );

  const renderNodeForm = () => {
    if (!selectedNode || !nodeData) return null;

    switch (selectedNode.type) {
      case 'node-start':
        return renderStartNodeForm();
      case 'node-model':
        return renderModelNodeForm();
      case 'node-end':
        return renderEndNodeForm();
      case 'node-utils':
        return renderUtilsNodeForm();
      case 'node-custom':
        return renderCustomNodeForm();
      default:
        return null;
    }
  };

  if (!selectedNode) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <p className="text-gray-500">请选择一个节点进行配置</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-lg font-semibold">节点属性</h2>
      <form>{renderNodeForm()}</form>
    </div>
  );
}; 