## 原理

1. 从开始节点开始，执行节点
```typescript
const startNodeDef = flow.find(isStartNode);
```
2. 将节点执行结果存储到上下文中, 根据节点类型，执行不同的操作
```typescript
const startNodeExecutor = getExecutor(startNodeDef);
const startNodeResult = await startNodeExecutor.execute(context, input);
context[nodeId] = result; // Store result in context
```
3. 获取下个节点
```typescript
const nextNodeIds = executor.getNextNodes();
```
4. 如果遇到结束节点，则返回结果
```typescript
return result;
```
