import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// ===
// FileSystemClient
// ===

export default class FileSystemClient {
    client: Client
    transport: StdioClientTransport

    constructor() {
        this.transport = new StdioClientTransport({
            command: "node",
            args: ["./src/mcp/filesystem_server.ts", "sandbox"]
        });

        this.client = new Client(
            {
                name: "filesystem-client",
                version: "1.0.0"
            },
            {
                capabilities: {
                    prompts: {},
                    resources: {},
                    tools: {}
                }
            }
        );
    }

    async callTool(tool: { name: string; arguments: any }) {
        return await this.client.callTool(tool);
    }

    async connect() {
        await this.client.connect(this.transport);
    }

    async listTools() {
        return await this.client.listTools();
    }

    close() {
        this.client.close();
    }
}

/*

const client = new FileSystemClient()
await client.connect()

const dirs = await client.callTool({
    name: "list_allowed_directories1",
    arguments: {}
})
console.log(dirs)


const tools = await client.listTools()
console.log(tools)

client.close()
*/

/*
// Call a tool
const result = await client.callTool({
    name: "example-tool",
    arguments: {
        arg1: "value"
    }
});
*/