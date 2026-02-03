import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";
import { NextRequest } from "next/server";

// Multi-agent architecture with specialized agents for each game
const serviceAdapter = new ExperimentalEmptyAdapter();

const deploymentUrl = process.env.LANGGRAPH_DEPLOYMENT_URL || "http://127.0.0.1:8123";
const langsmithApiKey = process.env.LANGSMITH_API_KEY || "";

// Helper to create LangGraph agents (type assertion to handle internal CopilotKit type mismatches)
const createAgent = (graphId: string) => new LangGraphAgent({
  deploymentUrl,
  graphId,
  langsmithApiKey,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

// Create the CopilotRuntime with multiple specialized agents
const runtime = new CopilotRuntime({
  agents: {
    // Router agent for general queries (home page)
    router_agent: createAgent("router_agent"),
    
    // Sudoku specialist agent
    sudoku_agent: createAgent("sudoku_agent"),
    
    // Chess specialist agent
    chess_agent: createAgent("chess_agent"),
    
    // Legacy agent for backward compatibility
    sample_agent: createAgent("sample_agent"),
  },
});

// Build a Next.js API route that handles the CopilotKit runtime requests
export const POST = async (req: NextRequest) => {
  // Extract agent selection from request
  const agentName = req.headers.get('x-copilot-agent') || 
                    req.nextUrl.searchParams.get('agent') ||
                    'router_agent'; // Default to router_agent
  
  console.log(`[CopilotKit] Routing to agent: ${agentName}`);
  
  // Select the correct agent based on the request
  // Using createAgent helper to handle internal CopilotKit type mismatches
  let selectedAgent;
  if (agentName === 'sudoku_agent') {
    selectedAgent = createAgent("sudoku_agent");
  } else if (agentName === 'chess_agent') {
    selectedAgent = createAgent("chess_agent");
  } else if (agentName === 'sample_agent') {
    selectedAgent = createAgent("sample_agent");
  } else {
    // Default to router_agent
    selectedAgent = createAgent("router_agent");
  }
  
  // Create a runtime with the selected agent as "default"
  const runtimeWithAgent = new CopilotRuntime({
    agents: {
      default: selectedAgent,
    },
  });
  
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime: runtimeWithAgent,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
