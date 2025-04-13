import { Handle, Position } from 'reactflow';

interface ModelNodeProps {
  data: {
    name: string;
    param: {
      provider: string;
      modal: string;
      knowledge_config?: {
        max_recall_num: number;
        min_recall_score: number;
        knowledge_id: string | null;
      };
      system_prompt?: Array<{
        type: string;
        value: string;
      }>;
    };
    content: Array<{
      type: string;
      value: string;
      key?: string;
    }>;
    output?: {
      key: string;
      type?: string;
      content?: Array<any>;
    };
  };
  id: string;
}

export const ModelNode = ({ data, id }: ModelNodeProps): JSX.Element => {
  // 计算内容摘要，显示前20个字符
  const contentSummary = data.content && data.content.length > 0 
    ? data.content[0].value.substring(0, 20) + (data.content[0].value.length > 20 ? '...' : '') 
    : '无内容';
  
  // 计算系统提示词摘要
  const promptSummary = data.param.system_prompt && data.param.system_prompt.length > 0
    ? data.param.system_prompt[0].value.substring(0, 20) + (data.param.system_prompt[0].value.length > 20 ? '...' : '')
    : '无系统提示';
  
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-400">
      <div className="flex flex-col">
        <div className="text-lg font-bold">{data.name}</div>
        <div className="text-xs text-gray-500">ID: {id}</div>
        <div className="text-gray-500">提供商: {data.param.provider}</div>
        <div className="text-gray-500">模型: {data.param.modal}</div>
        <div className="text-xs text-gray-400 mt-1">提示词: {promptSummary}</div>
        <div className="text-xs text-gray-400">内容: {contentSummary}</div>
        {data.output && (
          <div className="text-xs text-gray-400">
            输出: {data.output.key}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Top} className="w-16 !bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-blue-500" />
    </div>
  );
}; 