import { inngest } from "./client";
import {
  createAgent,
  createNetwork,
  createState,
  createTool,
  gemini,
  type Message,
  openai,
  type Tool,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { z } from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/lib/prompt";
import prisma from "@/lib/prisma";
import { SANDBOX_TIMEOUT } from "./types";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

// Create an Inngest function that processes AI coding requests
export const codeAgentFunction = inngest.createFunction(
  // Function configuration
  { id: "code-agent" }, // Unique identifier for this function
  { event: "code-agent/run" }, // Event type that triggers this function

  // Main function handler - runs when the event is received
  async ({ event, step }) => {
    // CREATE E2B SANDBOX ENVIRONMENT
    // Creates an isolated cloud environment where AI can run code
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("caffiene");
      await sandbox.setTimeout(SANDBOX_TIMEOUT);
      return sandbox.sandboxId; // Return unique ID for this sandbox
    });

    const previousMessages = await step.run(
      "get-previous-message",
      async () => {
        const formattedMessages: Message[] = [];

        // FETCH RECENT CONVERSATION HISTORY
        const messages = await prisma.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 6,
        });

        for (const message of messages) {
          formattedMessages.push({
            type: "text",
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: message.content,
          });
        }
        return formattedMessages.reverse();
      }
    );

    const state = createState<AgentState>(
      {
        summary: "",
        files: {},
      },
      {
        messages: previousMessages,
      }
    );

    // CREATE AI AGENT WITH TOOLS
    // Set up Gemini/OpenAI agent that can interact with the sandbox
    const codeAgent = createAgent<AgentState>({
      name: "codeAgent",
      description: "You are expert coding agent",
      system: PROMPT,

      model: openai({
        model: "gpt-4.1",
        defaultParameters: {
          temperature: 0.1, // Low temperature for more consistent code generation
        },
      }),

      // TOOLS THAT THE AI CAN USE
      tools: [
        // TERMINAL ACCESS
        // Allows AI to run command line operations in the sandbox
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(), // AI must provide a command string
          }),
          handler: async ({ command }, { step }) => {
            // Wrap terminal execution in Inngest step for reliability
            return await step?.run("terminal", async () => {
              // Create buffers to capture command output
              const buffer = { stdout: "", stderr: "" };

              try {
                // Connect to the sandbox we created earlier
                const sandbox = await getSandbox(sandboxId);

                // Execute the command in sandbox terminal
                const result = await sandbox.commands.run(command, {
                  // Capture normal output (success messages)
                  onStdout: (data: string) => {
                    buffer.stdout += data;
                  },
                  // Capture error output (error messages)
                  onStderr: (data: string) => {
                    buffer.stderr += data;
                  },
                });

                // Return the output to the AI
                return result.stdout;
              } catch (e) {
                // If command fails, log error and return detailed error info
                console.error(
                  `Command failed: ${e} \nstdout: ${buffer.stdout} \nstderror:${buffer.stderr}`
                );
                return `Command failed: ${e} \nstdout: ${buffer.stdout} \nstderror:${buffer.stderr}`;
              }
            });
          },
        }),

        // FILE CREATION/UPDATE - Allows AI to create or modify files in the sandbox
        createTool({
          name: "createOrUpdateFile",
          description: "Create or update a file in the sandbox",
          parameters: z.object({
            files: z.array(
              // AI can modify multiple files at once
              z.object({
                path: z.string(), // File path (e.g., "app/page.tsx")
                content: z.string(), // Complete file content
              })
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
            // Wrap file operations in Inngest step
            const newFiles = await step?.run("createOrUpdateFile", async () => {
              try {
                // Get current file state from network storage
                const updatedFiles = network.state.data.files || {};
                const sandbox = await getSandbox(sandboxId);

                // Write each file to the sandbox filesystem
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content; // Track file state
                }

                return updatedFiles;
              } catch (e) {
                return "Error" + e;
              }
            });

            // Store updated files in network state for persistence
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),

        //FILE READING - Allows AI to read existing files from the sandbox
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()), // Array of file paths to read
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];

                // Read each requested file
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }

                // Return file contents as JSON string
                return JSON.stringify(contents);
              } catch (e) {
                return "Error" + e;
              }
            });
          },
        }),
      ],

      // LIFECYCLE HOOKS - Process AI responses after each interaction
      lifecycle: {
        onResponse: async ({ result, network }) => {
          // Extract the last message from AI
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);

          // If AI response contains task summary, save it to state
          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }
          return result;
        },
      },
    });

    // CREATE AGENT NETWORK - Manages agent execution and iteration control
    const network = createNetwork<AgentState>({
      name: "codingAgent",
      agents: [codeAgent], // Single agent in this network
      maxIter: 12, // Maximum 12 iterations to prevent infinite loops
      defaultState: state,

      // Router determines which agent runs next (or stops execution)
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        // If AI has provided a task summary, stop execution
        if (summary) {
          return; // undefined = stop execution
        }

        // Otherwise, continue with the code agent
        return codeAgent;
      },
    });

    // RUN THE AI AGENT - Execute the agent with the user's input prompt
    const result = await network.run(event.data.value, { state });
    // event.data.value contains user input like "build a landing page"

    const fragmentTitleGenerator = createAgent({
      name: "fragment-title-generator",
      description: "fragment title generator",
      system: FRAGMENT_TITLE_PROMPT,

      model: gemini({
        model: "gemini-1.5-flash-8b",
      }),

      // model: openai({
      //   model: "gpt-4o",
      // }),
    });

    const responseGenerator = createAgent({
      name: "response-generator",
      description: "response generator",
      system: RESPONSE_PROMPT,

      model: gemini({
        model: "gemini-1.5-flash-8b",
      }),

      // model: openai({
      //   model: "gpt-4o",
      // }),
    });

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(
      result.state.data.summary
    );
    const { output: responseOutput } = await responseGenerator.run(
      result.state.data.summary
    );

    const generateFragmentTitle = () => {
      if (fragmentTitleOutput[0].type !== "text") {
        return "Fragment";
      }

      if (Array.isArray(fragmentTitleOutput[0].content)) {
        return fragmentTitleOutput[0].content.map((txt) => txt).join(" ");
      } else {
        return fragmentTitleOutput[0].content;
      }
    };

    const generateResponse = () => {
      if (responseOutput[0].type !== "text") {
        return "Here is what I built for you.";
      }

      if (Array.isArray(responseOutput[0].content)) {
        return responseOutput[0].content.map((txt) => txt).join(" ");
      } else {
        return responseOutput[0].content;
      }
    };

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    //GET SANDBOX URL
    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `http://${host}`;
    });

    // SAVE RESULTS TO DATABASE - Store AI's response and generated files in your database
    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }

      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: generateResponse(),
          role: "ASSISTANT", // Mark as AI response (vs USER message)
          type: "RESULT", // Message type classification

          // CREATE RELATED FRAGMENT RECORD
          // Store the generated app details
          fragment: {
            create: {
              sandboxUrl, // Live URL of the created app
              title: generateFragmentTitle(),
              files: result.state.data.files, // All files AI created/modified
            },
          },
        },
      });
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);

/**
User Request
    ↓
tRPC Mutation (triggers event: "code-agent/run")
    ↓ 
Inngest Function (codeAgentFunction)
    ↓
E2B Sandbox Creation
    ↓
AI Agent with TypeScript State Management
    ↓
Tool Execution (terminal, files, reading)
    ↓
Error Detection & Handling
    ↓
Database Storage (success or error message)
    ↓
Return Results
 */
