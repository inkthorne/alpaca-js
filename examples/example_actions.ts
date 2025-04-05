import ollama from 'ollama'
import FileSystemClient from '../src/mcp/filesystem_client.ts'
const backticks = "```"

// ===
// SYS_PROMPT
// ===

const SYS_PROMPT = String.raw`
You are a helpful and friendly assistant. You excel at following instructions,
answering questions, and working step-by-step through problems.

You are proficient at using 'actions' like reading a file, listing the contents
of a directory, or fetching a web-page. These 'actions' help you collect information
that is external to you, allowing you to answer questions and complete tasks more
quickly and more accurately than if you were to only use your internal knowledge alone.

## How to Use Actions

You will need to use 'actions' to successfully complete tasks. Use the following
JSON block to invoke the 'list_actions' action to get a list of all the actions
that are available to you:
${backticks}json
{
    "action": "list_actions"
}
${backticks}

### Action Tips

* Don't assume the results of the action, end your turn and wait for the user to respond.
* Do not invoke more than one action per turn.
* The results of the 'action' will be returned by the user on the following turn.
* Don't forget to escape your backslashes in JSON strings. For example, use '\\' instead of '\'.
`;

// ===
// USER_QUERY_1
// ===

const USER_QUERY_1 = String.raw`
# Your Task

Find the filenames that end with ".lock" in the current directory and output the names
in a JSON array.

## Instructions

1. First, use the 'list_actions' action to get a list of all the actions that are
available to you. Review the list and use it in step 2.

2. With the list of actions, make a plan of enumerated steps you are going to
take to solve the task.

3. Execute each step one at a time making sure to state which step you are
currently on. Only execute one step per turn. After each step, output the result of the
step and determine if the step was a success or failure. If the step failed,
make adjustments are retry the step.  Do not proceed to the next step until
the current step is successful.

4. When you have the final answer, output it in JSON format and end the turn
with the string '** DONE **'.

## Hints

When performing string matches or filtering, make sure you use an appropriate 'action' to 
double-check your results: for example, 'regex' or 'string_match'.
`

const client = new FileSystemClient()
await client.connect()

const model = 'gemma3:4b'
// const model = 'llama3.1:8b'
// const model = 'qwen2.5:7b'

const messages: { role: string, content: string }[] = []

async function chat() {
    const response = await ollama.chat({ model: model, messages: messages, stream: true })

    for await (const part of response) {
        process.stdout.write(part.message.content)
    }
}

console.log("--------------- SYSTEM:");
const message = { role: 'system', content: SYS_PROMPT }
messages.push(message)
console.log(SYS_PROMPT)

console.log("---------------- ASSISTANT:\n");
await chat()
console.log()

console.log("---------------- USER:\n");
const message2 = { role: 'user', content: USER_QUERY_1 }
messages.push(message2)
console.log(message2.content)

console.log("---------------- ASSISTANT:\n");
await chat()
console.log()

console.log("---------------- USER:\n");
const tools = await client.listTools()
const tools_block = `${backticks}\n${JSON.stringify(tools, null, 2)}\n${backticks}\n`
let content = `Here is the list of available actions:\n${tools_block}`
const message3 = { role: 'user', content: content }
messages.push(message3)
console.log(message3.content)

console.log("---------------- ASSISTANT:\n");
await chat()
console.log()

console.log("---------------- USER:\n");
content = "Can you tell me what directories are allowed to use?"
const message4 = { role: 'user', content: content }
messages.push(message4)
console.log(message4.content)

console.log("---------------- ASSISTANT:\n");
await chat()
console.log()

client.close()
