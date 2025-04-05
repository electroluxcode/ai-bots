# AI Bots

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
pnpm install
cd apps/mvp
pnpm run dev
```


### Build

To build all apps and packages, run the following command:

```
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
pnpm dev
```



## todo
在代码块节点中，变量可以这样表示
```json
{
  value: "Hello @Walter White, how are you?",
  mentions: [
    {
      label: "@Walter White",
      from: 6,  // 起始位置
      to: 18,   // 结束位置
    },
  ]
}

```