import { Handle, Position } from 'reactflow';

interface EndNodeProps {
  data: {
    name: string;
    output?: {
      type: string;
      content: Array<{
        type: string;
        key: string;
        value: string;
        description?: string;
      }>;
    };
  };
  id: string;
}

export const EndNode = ({ data, id }: EndNodeProps): JSX.Element => {
  // 计算输出字段数量
  const outputFieldCount = data.output?.content?.length || 0;
  
  return (
    <div className="px-4 py-2 bg-white border-2 border-red-400 rounded-md shadow-md">
      <div className="flex flex-col">
        <div className="text-lg font-bold">{data.name}</div>
        <div className="text-xs text-gray-500">ID: {id}</div>
        {data.output && (
          <>
            <div className="text-gray-500">输出类型: {data.output.type}</div>
            <div className="text-xs text-gray-400">
              含 {outputFieldCount} 个输出字段
            </div>
            {outputFieldCount > 0 && data.output.content && data.output.content[0] && (
              <div className="mt-1 text-xs text-gray-400">
                主要输出: {data.output.content[0].key}
              </div>
            )}
          </>
        )}
      </div>
      <Handle type="target" position={Position.Top} className="w-16 !bg-red-500" />
    </div>
  );
}; 