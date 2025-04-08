## 节点开发示例

### 1. 类型节点

通过class来定义节点

至少有三个class内的方法

- validateInput: 验证输入， 如果不想进行验证, 直接返回`true`
- execute: 执行(第一个传入context, 第二个传入input)
- getNextNodes: 获取下一个节点: 


其中如果开发者需要只需要定义 `validateInput` 和 `execute` 方法 即可


### 2. 功能节点

基础-通过class来定义节点

### 2.1 constructor

```typescript
constructor(protected node: LLMNode) {
    super(node);
}
```

自动注册node

### 2.2 execute

这个方法中开发需要注意三点, 都是可选的


#### 第一: 输入校验

示例代码如下
```typescript
if (!this.validateInput(input)) {
    throw new Error(`Start Node ${this.node.id}: Input validation failed.`);
}

```

#### 第二：解析上下文
获取上下文节点示例代码如下

```typescript

// type resolveInputValue = (item: { type: "field" | "input"; value: any }, context: FlowContext): any   
import { resolveInputValue } from "@ai-bots/utils";

// 获取上下文节点 伪代码
const input = resolveInputValue(item, {
    ...context,
    [this.node.id]: this.nodeinput
});

```


#### 第三：返回值
如果需要返回值，则需要调用 `resolveOutputValue` 方法

```typescript
import { resolveOutputValue } from "@ai-bots/utils";

const output = resolveOutputValue({
    key: "response"
}, nodeResult);
return output;

```
