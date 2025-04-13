import { Handle, Position } from 'reactflow';

interface StartNodeProps {
  data: {
    name: string;
    param: {
      trigger: string;
    };
    input?: {
      type: string;
      content: Array<{
        type: string;
        value: string;
        key?: string;
      }>;
    };
    content?: Array<{
      type: string;
      value: string;
      key?: string;
    }>;
    output?: {
      key: string;
      type?: string;
      content?: Array<any>;
    };
    id?: string;
  };
  id: string;
}

export const StartNode = ({ data, id }: StartNodeProps): JSX.Element => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex flex-col">
        <div className="text-lg font-bold">{data.name}</div>
        <div className="text-xs text-gray-500">ID: {id}</div>
        <div className="text-gray-500">Trigger: {data.param.trigger}</div>
        {data.input && (
          <div className="text-xs text-gray-400">
            输入: {data.input.type} 
            ({data.input.content?.length || 0}个字段)
          </div>
        )}
        {data.output && (
          <div className="text-xs text-gray-400">
            输出: {data.output.key}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
    </div>
  );
}; 