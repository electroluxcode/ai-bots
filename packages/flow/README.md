# @ai-bots/flow

流程编辑器组件库，用于可视化构建和编辑工作流。

## 特性

- 直观的拖放式流程图构建界面
- 丰富的节点类型支持（开始节点、大模型节点、工具节点、自定义节点、结束节点）
- 完整的节点属性编辑面板
- 灵活的数据输入/输出配置
- 响应式设计
- 易于集成到现有React应用

## 安装

```bash
# 使用 npm
npm install @ai-bots/flow

# 使用 yarn
yarn add @ai-bots/flow

# 使用 pnpm
pnpm add @ai-bots/flow
```

## 使用方法

### 基本用法

```jsx
import React, { useState } from 'react';
import { FlowEditor, FlowData } from '@ai-bots/flow';
import '@ai-bots/flow/style.css'; // 导入样式

// 初始流程数据
const initialFlow = [
  {
    id: "node-start-123456",
    version: "v1",
    type: "node-start",
    name: "开始节点",
    next_nodes: ["node-model-234567"],
    param: {
      trigger: "api"
    },
    output: {
      key: "response",
      type: "object"
    }
  },
  {
    id: "node-model-234567",
    version: "v1",
    type: "node-model",
    name: "大模型节点",
    next_nodes: ["node-end-345678"],
    param: {
      provider: "deepseek",
      modal: "deepseek-chat",
      knowledge_config: {
        max_recall_num: 10,
        min_recall_score: 0.5,
        knowledge_id: null
      },
      system_prompt: [{
        type: "input",
        value: "你是一个专业的AI助手"
      }]
    },
    content: [{
      type: "input",
      value: "请根据我的需求回答问题"
    }],
    output: {
      key: "response"
    }
  },
  {
    id: "node-end-345678",
    version: "v1",
    type: "node-end",
    name: "结束节点",
    next_nodes: [],
    param: {},
    output: {
      type: "form",
      content: [{
        type: "input",
        key: "code",
        value: "200"
      }]
    }
  }
];

function App() {
  const [flowData, setFlowData] = useState(initialFlow);
  
  const handleSaveFlow = (data) => {
    setFlowData(data);
    console.log('流程已保存:', data);
    // 这里可以将数据发送到服务器或进行其他处理
  };
  
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <FlowEditor 
        flowData={flowData} 
        onSave={handleSaveFlow} 
      />
    </div>
  );
}

export default App;
```

### 在非React环境中使用

如果你需要在非React项目中使用，可以通过加载UMD格式的文件：

```html
<!DOCTYPE html>
<html>
<head>
  <title>Flow Editor Example</title>
  <!-- 加载React和ReactDOM -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  
  <!-- 加载ReactFlow -->
  <script src="https://unpkg.com/reactflow@11/dist/umd/reactflow.min.js"></script>
  <link href="https://unpkg.com/reactflow@11/dist/style.css" rel="stylesheet">
  
  <!-- 加载@ai-bots/flow -->
  <script src="./node_modules/@ai-bots/flow/dist/index.umd.js"></script>
  <link href="./node_modules/@ai-bots/flow/dist/style.css" rel="stylesheet">
  
  <style>
    body, html, #root {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script>
    // 创建React应用
    const App = () => {
      const [flowData, setFlowData] = React.useState([/* 初始流程数据 */]);
      
      const handleSaveFlow = (data) => {
        setFlowData(data);
        console.log('保存流程:', data);
      };
      
      return React.createElement('div', { style: { height: '100%' }},
        React.createElement(AIBotsFlow.FlowEditor, {
          flowData: flowData,
          onSave: handleSaveFlow
        })
      );
    };
    
    // 渲染应用
    ReactDOM.render(React.createElement(App), document.getElementById('root'));
  </script>
</body>
</html>
```

## API

### FlowEditor

主要组件，用于渲染完整的流程编辑器界面。

#### Props

| 属性名 | 类型 | 必须 | 描述 |
|--------|------|------|------|
| flowData | Array<FlowData> | 是 | 流程数据 |
| onSave | (data: Array<FlowData>) => void | 否 | 保存流程时的回调函数 |

### FlowData

流程节点的数据类型。

| 属性名 | 类型 | 必须 | 描述 |
|--------|------|------|------|
| id | string | 是 | 节点唯一标识 |
| version | string | 是 | 版本信息 |
| type | string | 是 | 节点类型 (node-start, node-model, node-utils, node-end, node-custom) |
| name | string | 是 | 节点名称 |
| next_nodes | Array<string> | 是 | 下一个节点IDs |
| param | Record<string, unknown> | 是 | 节点参数配置 |
| content | Array<{type: string, value: string, key?: string}> | 否 | 节点内容配置 |
| input | {type: string, content: Array<{type: string, value: string, key?: string}>} | 否 | 节点输入配置 |
| output | Record<string, unknown> | 否 | 节点输出配置 |

## 节点类型

组件支持以下预定义节点类型：

1. **开始节点 (node-start)**
   - 作为流程的入口点
   - 可配置触发方式 (API, Webhook, Schedule)

2. **大模型节点 (node-model)**
   - 用于调用大模型服务
   - 可配置提供商、模型类型、知识库设置、系统提示词等

3. **工具节点 (node-utils)**
   - 用于调用外部工具服务
   - 支持邮件、HTTP、数据库等工具类型

4. **自定义节点 (node-custom)**
   - 用于创建自定义逻辑和服务
   - 可自由配置参数和属性

5. **结束节点 (node-end)**
   - 作为流程的终点
   - 可配置返回格式和内容

## 本地开发

如果你想为此项目贡献代码或进行本地调试：

```bash
# 克隆仓库
git clone <repository-url>
cd ai-bots/apps/flow

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建库文件
npm run build:lib
```

## 在同一工作区中使用

如果你在monorepo中使用此组件，可以在UI项目中执行以下操作：

```bash
# 在UI项目中
cd apps/ui
npm run install-flow
```

这将构建flow库并在UI项目中链接它。

## 许可证

MIT

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