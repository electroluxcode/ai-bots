import { Handle, Position } from 'reactflow';

interface UtilsNodeProps {
  data: {
    name: string;
    param: {
      type: string;
      prettyFn?: string;
    };
    content: Array<{
      type: string;
      key: string;
      value: string;
    }>;
    output?: {
      key: string;
      type?: string;
      content?: Array<any>;
    };
  };
  id: string;
}

export const UtilsNode = ({ data, id }: UtilsNodeProps): JSX.Element => {
  // 计算内容字段数量
  const contentFieldCount = data.content?.length || 0;
  
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-purple-400">
      <div className="flex flex-col">
        <div className="text-lg font-bold">{data.name}</div>
        <div className="text-xs text-gray-500">ID: {id}</div>
        <div className="text-gray-500">工具类型: {data.param.type}</div>
        <div className="text-xs text-gray-400">
          含 {contentFieldCount} 个配置字段
        </div>
        {contentFieldCount > 0 && (
          <div className="text-xs text-gray-400 mt-1">
            {data.content[0].key}: {data.content[0].value.substring(0, 15)}
            {data.content[0].value.length > 15 ? '...' : ''}
          </div>
        )}
        {data.output && (
          <div className="text-xs text-gray-400">
            输出: {data.output.key}
          </div>
        )}
      </div>
      <Handle 
        className="w-16 !bg-purple-500" 
        position={Position.Top} 
        type="target" 
      />
      <Handle 
        className="w-16 !bg-purple-500" 
        position={Position.Bottom} 
        type="source" 
      />
    </div>
  );
}; 