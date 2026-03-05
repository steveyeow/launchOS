import { generateText, type CoreMessage, type Tool } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import { db, tasks, executions } from "../db/index.js";
import { eq } from "drizzle-orm";
import type { AgentName, TaskResultData } from "../../../shared/types.js";

export interface AgentRunInput {
  taskId: string;
  userId: string;
  goal: string;
  productProfile: {
    valueProp: string;
    icpSummary: string;
    icpTitles: string[];
    icpIndustries: string[];
    painPoints: string[];
  };
}

export interface AgentRunResult {
  summary: string;
  data: TaskResultData;
}

// Base class for all specialist agents.
// Handles the agentic loop (tool calling), task status updates, and execution logging.
export abstract class BaseAgent {
  abstract name: AgentName;
  abstract systemPrompt: string;
  abstract tools: Record<string, Tool>;

  // Entry point called by the task queue worker
  async run(input: AgentRunInput): Promise<AgentRunResult> {
    await this.updateTaskStatus(input.taskId, "running");

    try {
      const result = await this.execute(input);
      await this.updateTaskStatus(input.taskId, "completed", result.summary, result.data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await this.updateTaskStatus(input.taskId, "failed", undefined, undefined, message);
      throw err;
    }
  }

  // Subclasses implement this with their specific logic
  protected abstract execute(input: AgentRunInput): Promise<AgentRunResult>;

  // Run a single agentic loop with the given messages and return the final text
  protected async runAgenticLoop(messages: CoreMessage[]): Promise<{ text: string; toolCalls: unknown[] }> {
    const { text, steps } = await generateText({
      model:    deepseek("deepseek-chat"),
      system:   this.systemPrompt,
      messages,
      tools:    this.tools,
      maxSteps: 10, // prevent infinite loops
    });

    // Flatten all tool calls across steps for logging
    const toolCalls = steps.flatMap((s) => s.toolCalls ?? []);
    return { text, toolCalls };
  }

  protected async logExecution(
    taskId: string,
    step: number,
    toolName: string,
    input: unknown,
    output: unknown,
    status: "success" | "error",
    durationMs: number
  ): Promise<void> {
    await db.insert(executions).values({
      taskId,
      step,
      toolName,
      toolInput:  input as Record<string, unknown>,
      toolOutput: output as Record<string, unknown>,
      status,
      durationMs,
    });
  }

  private async updateTaskStatus(
    taskId: string,
    status: "running" | "completed" | "failed",
    resultSummary?: string,
    resultData?: TaskResultData,
    error?: string
  ): Promise<void> {
    await db.update(tasks)
      .set({
        status,
        ...(status === "running"    && { startedAt: new Date() }),
        ...(status === "completed"  && { completedAt: new Date(), resultSummary, resultData }),
        ...(status === "failed"     && { completedAt: new Date(), error }),
      })
      .where(eq(tasks.id, taskId));
  }
}
