## 1.扩展节点

### 1.1 节点组件

`apps/flow/src/components/Flow/nodes/[YourNodeName].tsx`

节点的外观和数据结构

```tsx
import { Handle, Position } from 'reactflow';

interface CustomNodeProps {
  data: {
    name: string;
    param: {
      customField: string;
      otherProperty: string;
    };
  };
}

export const CustomNode = ({ data }: CustomNodeProps): JSX.Element => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-yellow-400">
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">{data.name}</div>
          <div className="text-gray-500">自定义字段: {data.param.customField}</div>
          <div className="text-gray-500">其他属性: {data.param.otherProperty}</div>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="w-16 !bg-yellow-500" />
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-yellow-500" />
    </div>
  );
};

```

### 1.2 注册组件

`apps/flow/src/components/Flow/FlowEditor.tsx`

```js
const nodeTypes: NodeTypes = {
  'node-start': StartNode,
  'node-model': ModelNode,
  'node-utils': UtilsNode,
  'node-end': EndNode,
  'node-custom': CustomNode, // 您添加的新节点
};
```


添加默认参数

```jsx
else if (nodeType === 'node-custom') {
  param = { 
    customField: '默认值',
    otherProperty: '其他默认值'
  };
}

```


### 1.3 注册面板

`apps/flow/src/components/Flow/NodePanel.tsx`


```js
const nodeTypes: NodeTypes = {
  'node-start': StartNode,
  'node-model': ModelNode,
  'node-utils': UtilsNode,
  'node-end': EndNode,
  'node-custom': CustomNode, // 您添加的新节点
};
```

### 1.4 注册属性面板

`apps/flow/src/components/Flow/NodeProperties.tsx`

```jsx

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
    {/* 其他属性字段... */}
  </>
);
```

在 renderNodeForm 中添加对新节点的支持:

```jsx
const renderNodeForm = () => {
  if (!selectedNode || !nodeData) return null;

  switch (selectedNode.type) {
    case 'node-start':
      return renderStartNodeForm();
    // ...其他节点类型...
    case 'node-custom':
      return renderCustomNodeForm();
    default:
      return null;
  }
};
```