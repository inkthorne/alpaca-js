import ollama from 'ollama'

// ===
// AlpacaSession
// ===

export class AlpacaSession {
    messages: { role: string, content: string }[]
    model: string
    options: object

    constructor(model: string) {
        this.messages = []
        this.model = model
        this.options = {
            num_ctx: 4096,
        }
    }

    async user(question: string) {
        this.messages.push({ role: 'user', content: question })

        process.stdout.write("\n======== USER:\n\n")
        process.stdout.write(question)
        process.stdout.write("\n")

        const response = await ollama.chat({ model: this.model, messages: this.messages, options: this.options, stream: true })
        let answer: string = ""

        process.stdout.write("\n======== ASSISTANT:\n\n")

        for await (const part of response) {
            answer += part.message.content
            process.stdout.write(part.message.content)
        }

        this.messages.push({ role: 'assistant', content: answer })
        process.stdout.write("\n")
    }

    blockify(content: any): string {
        const backticks = "```"
        return `${backticks}json\n${JSON.stringify(content, null, 2)}\n${backticks}\n`
    }
}
