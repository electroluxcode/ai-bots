import { useCallback, useState, useEffect } from 'react';
import { Node } from 'reactflow';

interface NodePropertiesProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
}

export const NodeProperties = ({ selectedNode, onNodeUpdate }: NodePropertiesProps): JSX.Element => {
  const [nodeData, setNodeData] = useState<any>(null);
  const [newNodeId, setNewNodeId] = useState<string>('');

  useEffect(() => {
    if (selectedNode) {
      setNodeData({ ...selectedNode.data });
      setNewNodeId(selectedNode.id);
      
      // 初始化EndNode的数据结构
      if (selectedNode.type === 'node-end' && selectedNode.data) {
        // 延迟一下，确保nodeData已经设置好
        setTimeout(() => {
          const nodeData = selectedNode.data;
          if (!nodeData.output) {
            const updatedData = {
              ...nodeData,
              output: { type: 'form', content: [] }
            };
            onNodeUpdate(selectedNode.id, updatedData);
          } else if (!nodeData.output.content) {
            const updatedData = {
              ...nodeData,
              output: { 
                ...nodeData.output,
                content: [] 
              }
            };
            onNodeUpdate(selectedNode.id, updatedData);
          }
        }, 100);
      }
    } else {
      setNodeData(null);
      setNewNodeId('');
    }
  }, [selectedNode, onNodeUpdate]);

  // 为 EndNode 提供的额外初始化 effect
  useEffect(() => {
    if (selectedNode && nodeData && selectedNode.type === 'node-end') {
      // 确保output对象初始化
      if (!nodeData.output) {
        setNodeData((prevData: Record<string, any>) => {
          const updatedData = { 
            ...prevData, 
            output: { 
              type: 'form', 
              content: [] 
            } 
          };
          // 使用setTimeout确保状态更新后再调用onNodeUpdate
          setTimeout(() => {
            onNodeUpdate(selectedNode.id, updatedData);
          }, 0);
          return updatedData;
        });
      } else if (!nodeData.output.content) {
        // 如果output存在但content不存在，也初始化content
        setNodeData((prevData: Record<string, any>) => {
          const updatedData = { 
            ...prevData, 
            output: { 
              ...prevData['output'],
              content: [] 
            } 
          };
          setTimeout(() => {
            onNodeUpdate(selectedNode.id, updatedData);
          }, 0);
          return updatedData;
        });
      }
    }
  }, [selectedNode, nodeData, onNodeUpdate]);

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

  // 特殊处理：修改节点ID
  const handleIdChange = useCallback(() => {
    if (!selectedNode || !newNodeId.trim()) return;
    
    // ID改变需要特殊处理，ReactFlow会自动处理节点ID和边的更新
    const event = new CustomEvent('node-id-change', { 
      detail: { 
        oldId: selectedNode.id, 
        newId: newNodeId 
      } 
    });
    window.dispatchEvent(event);
  }, [selectedNode, newNodeId]);

  // 渲染ID编辑区域
  const renderIdEditor = () => (
    <div className="p-3 mb-4 border border-gray-200 rounded-md bg-gray-50">
      <label className="block mb-1 text-sm font-medium text-gray-700">节点ID</label>
      <div className="flex flex-col space-y-2">
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          value={newNodeId}
          disabled={true}
          onChange={(e) => setNewNodeId(e.target.value)}
        />
        {/* <button
          className="py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          onClick={handleIdChange}
        >
          更新节点ID
        </button> */}
      </div>
      <p className="mt-1 text-xs text-gray-500">
        注意：更改ID将影响与该节点相关的所有连接
      </p>
    </div>
  );

  // 渲染添加新字段按钮 - 用 useCallback 包装以避免不必要的重新渲染
  const renderAddFieldButton = useCallback((arrayPath: string, template: any) => (
    <button
      className="px-2 py-1 mt-2 text-xs text-white bg-green-500 rounded hover:bg-green-600"
      onClick={(e) => {
        // 阻止事件冒泡，防止触发其他点击事件
        e.preventDefault();
        e.stopPropagation();
        
        if (!nodeData || !selectedNode) return;
        
        const keys = arrayPath.split('.');
        // 使用函数式更新而不是依赖先前的状态
        setNodeData((prevData: Record<string, any>) => {
          const updatedData = { ...prevData };
          let current = updatedData;
          
          // 导航到目标数组并确保路径上所有的对象都存在
          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (key) {
              // 确保当前路径上的对象存在
              if (!(key in current)) {
                current[key] = {}; // 初始化为空对象
              }
              // 确保是对象类型然后再继续
              if (typeof current[key] !== 'object' || current[key] === null) {
                current[key] = {};
              }
              current = current[key] as Record<string, any>;
            }
          }
          
          // 添加新字段
          const lastKey = keys[keys.length - 1];
          if (lastKey) {
            // 确保最后一个键存在并且是数组类型
            if (!(lastKey in current) || !Array.isArray(current[lastKey])) {
              current[lastKey] = [];
            }
            const targetArray = current[lastKey] as Array<any>;
            targetArray.push({ ...template });
          }
          
          return updatedData;
        });
        
        // 使用函数式更新保证我们使用最新的状态
        setNodeData((latestData: Record<string, any>) => {
          // 确保回调在状态更新后调用
          setTimeout(() => {
            onNodeUpdate(selectedNode.id, latestData);
          }, 0);
          return latestData;
        });
      }}
    >
      + 添加字段
    </button>
  ), [nodeData, selectedNode, onNodeUpdate]);

  // 渲染数组字段
  const renderArrayField = useCallback(
    (
      arrayPath: string, 
      titleKey: string,
      fields: Array<{
        key: string;
        label: string;
        type: 'text' | 'select';
        options?: Array<{value: string; label: string}>;
      }>,
      template?: any // Optional template parameter
    ) => {
      if (!nodeData) return null;
      
      // 获取数组数据
      const getArrayData = () => {
        const keys = arrayPath.split('.');
        let current = nodeData;
        
        for (const key of keys) {
          if (!current || !(key in current)) {
            // 如果当前对象或键不存在，返回一个空数组
            return [];
          }
          current = current[key as keyof typeof current];
        }
        
        return Array.isArray(current) ? current : [];
      };
      
      const arrayData = getArrayData();

      // 创建默认的模板，如果没有提供则基于字段创建
      const fieldTemplate = template || fields.reduce((acc: Record<string, string>, field) => {
        acc[field.key] = field.key === 'type' ? 'input' : ''; // 为type字段默认设置为'input'
        return acc;
      }, {});
      
      return (
        <div className="p-2 my-3 border border-gray-200 rounded-md">
          <h4 className="mb-2 text-sm font-medium text-gray-700">{titleKey}</h4>
          
          {arrayData.map((item: any, index) => (
            <div className="p-2 mb-3 rounded bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">项目 #{index + 1}</span>
                <button
                  className="text-xs text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    // 阻止事件冒泡
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (!selectedNode) return;
                    
                    // 使用函数式更新
                    setNodeData((prevData: Record<string, any>) => {
                      const updatedData = { ...prevData };
                      const keys = arrayPath.split('.');
                      let current = updatedData;
                      
                      // 导航到目标数组
                      for (let i = 0; i < keys.length - 1; i++) {
                        const key = keys[i];
                        if (key) {
                          current = current[key as keyof typeof current] as Record<string, any>;
                        }
                      }
                      
                      // 删除项目
                      const lastKey = keys[keys.length - 1];
                      if (lastKey) {
                        (current[lastKey as keyof typeof current] as Array<any>).splice(index, 1);
                      }
                      
                      return updatedData;
                    });
                    
                    // 确保使用最新状态更新节点
                    setNodeData((latestData: Record<string, any>) => {
                      setTimeout(() => {
                        onNodeUpdate(selectedNode.id, latestData);
                      }, 0);
                      return latestData;
                    });
                  }}
                >
                  删除
                </button>
              </div>
              
              {fields.map((field) => (
                <div className="mb-2">
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    {field.label}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      className="w-full p-1 text-sm border rounded-md"
                      value={item[field.key] || ''}
                      onChange={(e) => {
                        // 阻止事件冒泡
                        e.stopPropagation();
                        
                        if (!selectedNode) return;
                        
                        setNodeData((prevData: Record<string, any>) => {
                          const updatedData = { ...prevData };
                          const keys = arrayPath.split('.');
                          let current = updatedData;
                          
                          // 导航到目标数组
                          for (let i = 0; i < keys.length - 1; i++) {
                            const key = keys[i];
                            if (key) {
                              current = current[key as keyof typeof current] as Record<string, any>;
                            }
                          }
                          
                          // 更新字段
                          const lastKey = keys[keys.length - 1];
                          if (lastKey) {
                            (current[lastKey as keyof typeof current] as Array<any>)[index][field.key] = e.target.value;
                          }
                          
                          return updatedData;
                        });
                        
                        // 确保使用最新状态更新节点
                        setNodeData((latestData: Record<string, any>) => {
                          setTimeout(() => {
                            onNodeUpdate(selectedNode.id, latestData);
                          }, 0);
                          return latestData;
                        });
                      }}
                    >
                      {field.options?.map((option) => (
                        <option value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="w-full p-1 text-sm border rounded-md"
                      value={item[field.key] || ''}
                      onChange={(e) => {
                        // 阻止事件冒泡
                        e.stopPropagation();
                        
                        if (!selectedNode) return;
                        
                        setNodeData((prevData: Record<string, any>) => {
                          const updatedData = { ...prevData };
                          const keys = arrayPath.split('.');
                          let current = updatedData;
                          
                          // 导航到目标数组
                          for (let i = 0; i < keys.length - 1; i++) {
                            const key = keys[i];
                            if (key) {
                              current = current[key as keyof typeof current] as Record<string, any>;
                            }
                          }
                          
                          // 更新字段
                          const lastKey = keys[keys.length - 1];
                          if (lastKey) {
                            (current[lastKey as keyof typeof current] as Array<any>)[index][field.key] = e.target.value;
                          }
                          
                          return updatedData;
                        });
                        
                        // 确保使用最新状态更新节点
                        setNodeData((latestData: Record<string, any>) => {
                          setTimeout(() => {
                            onNodeUpdate(selectedNode.id, latestData);
                          }, 0);
                          return latestData;
                        });
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
          
          {renderAddFieldButton(arrayPath, fieldTemplate)}
        </div>
      );
    },
    [nodeData, selectedNode, onNodeUpdate, renderAddFieldButton]
  );

  const renderStartNodeForm = () => (
    <>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">节点名称</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          value={nodeData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">触发方式</label>
        <select
          className="w-full p-2 border rounded-md"
          value={nodeData.param?.trigger || 'api'}
          onChange={(e) => handleInputChange('param.trigger', e.target.value)}
        >
          <option value="api">API</option>
          <option value="webhook">Webhook</option>
          <option value="schedule">Schedule</option>
        </select>
      </div>
      
      <h3 className="mt-4 mb-2 text-sm font-semibold text-gray-700">输入配置</h3>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">输入类型</label>
        <select
          className="w-full p-2 border rounded-md"
          value={nodeData.input?.type || 'object'}
          onChange={(e) => handleInputChange('input.type', e.target.value)}
        >
          <option value="object">Object</option>
          <option value="array">Array</option>
          <option value="string">String</option>
        </select>
      </div>
      
      {/* 输入内容字段配置 */}
      {renderArrayField(
        'input.content',
        '输入字段配置',
        [
          { key: 'type', label: '类型', type: 'select', options: [
            { value: 'key', label: '键名' },
            { value: 'value', label: '值' }
          ]},
          { key: 'value', label: '值', type: 'text' }
        ],
        { type: 'input', key: '', value: '' }
      )}
      
      <h3 className="mt-4 mb-2 text-sm font-semibold text-gray-700">输出配置</h3>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">输出键名</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          value={nodeData.output?.key || 'response'}
          onChange={(e) => handleInputChange('output.key', e.target.value)}
        />
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
          value={nodeData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">提供商</label>
        <select
          className="w-full p-2 border rounded-md"
          value={nodeData.param?.provider || ''}
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
          value={nodeData.param?.modal || ''}
          onChange={(e) => handleInputChange('param.modal', e.target.value)}
        />
      </div>
      
      <h3 className="mt-4 mb-2 text-sm font-semibold text-gray-700">知识库配置</h3>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">最大召回数量</label>
        <input
          type="number"
          className="w-full p-2 border rounded-md"
          value={nodeData.param?.knowledge_config?.max_recall_num || 10}
          onChange={(e) => handleInputChange('param.knowledge_config.max_recall_num', e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">最小召回分数</label>
        <input
          type="number"
          className="w-full p-2 border rounded-md"
          step="0.1"
          value={nodeData.param?.knowledge_config?.min_recall_score || 0.5}
          onChange={(e) => handleInputChange('param.knowledge_config.min_recall_score', e.target.value)}
        />
      </div>
      
      {/* 系统提示词配置 */}
      {renderArrayField(
        'param.system_prompt',
        '系统提示词',
        [
          { key: 'type', label: '类型', type: 'select', options: [
            { value: 'input', label: '固定输入' },
            { value: 'field', label: '引用字段' }
          ]},
          { key: 'value', label: '值', type: 'text' }
        ],
        { type: 'input', key: '', value: '' }
      )}
      
      {/* 内容配置 */}
      {renderArrayField(
        'content',
        '内容配置',
        [
          { key: 'type', label: '类型', type: 'select', options: [
            { value: 'input', label: '固定输入' },
            { value: 'field', label: '引用字段' }
          ]},
          { key: 'value', label: '值', type: 'text' }
        ],
        { type: 'input', key: '', value: '' }
      )}
      
      <h3 className="mt-4 mb-2 text-sm font-semibold text-gray-700">输出配置</h3>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">输出键名</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          value={nodeData.output?.key || 'response'}
          onChange={(e) => handleInputChange('output.key', e.target.value)}
        />
      </div>
    </>
  );

  const renderEndNodeForm = () => {
    return (
      <>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">节点名称</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            value={nodeData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </div>
        
        <h3 className="mt-4 mb-2 text-sm font-semibold text-gray-700">输出配置</h3>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">输出类型</label>
          <select
            className="w-full p-2 border rounded-md"
            value={nodeData.output?.type || 'form'}
            onChange={(e) => {
              // 确保output对象已初始化
              if (!nodeData.output) {
                // 直接更新nodeData，而不是通过handleInputChange
                setNodeData((prevData: Record<string, any>) => {
                  const updatedData = { ...prevData, output: { type: e.target.value, content: [] } };
                  // 使用setTimeout确保状态更新后再调用onNodeUpdate
                  setTimeout(() => {
                    if (selectedNode) {
                      onNodeUpdate(selectedNode.id, updatedData);
                    }
                  }, 0);
                  return updatedData;
                });
              } else {
                handleInputChange('output.type', e.target.value);
              }
            }}
          >
            <option value="form">表单</option>
            <option value="json">JSON</option>
            <option value="text">文本</option>
          </select>
        </div>
        
        {/* 输出内容字段配置 */}
        {renderArrayField(
          'output.content',
          '输出字段配置',
          [
            { key: 'type', label: '类型', type: 'select', options: [
              { value: 'input', label: '固定输入' },
              { value: 'field', label: '引用字段' }
            ]},
            { key: 'key', label: '键名', type: 'text' },
            { key: 'value', label: '值', type: 'text' },
            { key: 'description', label: '描述', type: 'text' }
          ],
          // 提供一个完整的模板，确保类型默认为'input'
          { type: 'input', key: '', value: '', description: '' }
        )}
      </>
    );
  };

  const renderUtilsNodeForm = () => (
    <>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">节点名称</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          value={nodeData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">工具类型</label>
        <select
          className="w-full p-2 border rounded-md"
          value={nodeData.param?.type || ''}
          onChange={(e) => handleInputChange('param.type', e.target.value)}
        >
          <option value="email">Email</option>
          <option value="http">HTTP</option>
          <option value="database">Database</option>
        </select>
      </div>
      
      {/* 内容配置 */}
      {renderArrayField(
        'content',
        '内容配置',
        [
          { key: 'type', label: '类型', type: 'select', options: [
            { value: 'input', label: '固定输入' },
            { value: 'field', label: '引用字段' }
          ]},
          { key: 'key', label: '键名', type: 'text' },
          { key: 'value', label: '值', type: 'text' }
        ],
        { type: 'input', key: '', value: '' }
      )}
      
      <h3 className="mt-4 mb-2 text-sm font-semibold text-gray-700">输出配置</h3>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">输出键名</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          value={nodeData.output?.key || 'response'}
          onChange={(e) => handleInputChange('output.key', e.target.value)}
        />
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
          value={nodeData.name || ''}
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
      
      {/* 内容配置 */}
      {renderArrayField(
        'content',
        '内容配置',
        [
          { key: 'type', label: '类型', type: 'select', options: [
            { value: 'input', label: '固定输入' },
            { value: 'field', label: '引用字段' }
          ]},
          { key: 'value', label: '值', type: 'text' }
        ],
        { type: 'input', key: '', value: '' }
      )}
      
      <h3 className="mt-4 mb-2 text-sm font-semibold text-gray-700">输出配置</h3>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">输出键名</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          value={nodeData.output?.key || 'custom_output'}
          onChange={(e) => handleInputChange('output.key', e.target.value)}
        />
      </div>
    </>
  );

  const renderNodeForm = () => {
    if (!selectedNode || !nodeData) return null;

    return (
      <>
        {renderIdEditor()}
        
        {selectedNode.type === 'node-start' && renderStartNodeForm()}
        {selectedNode.type === 'node-model' && renderModelNodeForm()}
        {selectedNode.type === 'node-end' && renderEndNodeForm()}
        {selectedNode.type === 'node-utils' && renderUtilsNodeForm()}
        {selectedNode.type === 'node-custom' && renderCustomNodeForm()}
      </>
    );
  };

  if (!selectedNode) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <p className="text-gray-500">请选择一个节点进行配置</p>
      </div>
    );
  }

  return (
    <div className="h-full p-4 overflow-auto bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-lg font-semibold">节点属性</h2>
      <form>{renderNodeForm()}</form>
    </div>
  );
}; 