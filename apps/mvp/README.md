## base_workflow_email

示例 pretty
```js
const updateAiSearch = async(param) => {
	let textTemple = ""
	param.choices.forEach(page => {
		textTemple = textTemple +  `
			<div style="margin-bottom:20px;border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding:10px 10px">
				<div><a  style="text-decoration: none; color: #007BFF;">${param.userPrompt}</a></div>
				<div style="font-size: 10px;margin-top:5px"><strong>来源:</strong> ${param.model}</div>
				<div style="font-size: 10px;margin-top:5px"><strong>摘要:</strong> ${page.content}</div>
			</div>
		`;
		
	});return textTemple
}

```