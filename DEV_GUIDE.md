## 节点开发示例

### 1. 类型节点

通过class来定义节点

至少有三个class内的方法

- validateInput: 验证输入， 如果不想进行验证, 直接返回`true`
- execute: 执行(第一个传入context, 第二个传入input)
- getNextNodes: 获取下一个节点: 


其中如果开发者需要只需要定义 `validateInput` 和 `execute` 方法 即可


### 2. 功能节点

### 2.1 基础-通过class来定义节点

```typescript
constructor(protected node: LLMNode) {
    super(node);
}
```


### 2.2 execute-获取上下文节点

```typescript
/**
    其中 resolveInputValue 的实现 是 根据 item 的 type(input/field) 
    然后 调用context路径 获取 上下文，注意 field的规则是  
 */
// type resolveInputValue = (item: { type: string; value: any }, context: FlowContext): any   
import { resolveInputValue } from "@ai-bots/utils";

// 获取上下文节点
const input = resolveInputValue(this.node.param.context, context);


```