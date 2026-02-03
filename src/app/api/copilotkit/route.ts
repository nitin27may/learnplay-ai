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

// Create the CopilotRuntime with multiple specialized agents
const runtime = new CopilotRuntime({
  agents: {
    // Router agent for general queries (home page)
    router_agent: new LangGraphAgent({
      deploymentUrl,
      graphId: "router_agent",
      langsmithApiKey,
    }),
    
    // Sudoku specialist agent
    sudoku_agent: new LangGraphAgent({
      deploymentUrl,
      graphId: "sudoku_agent",
      langsmithApiKey,
    }),
    
    // Chess specialist agent
    chess_agent: new LangGraphAgent({
      deploymentUrl,
      graphId: "chess_agent",
      langsmithApiKey,
    }),
    
    // Legacy agent for backward compatibility
    sample_agent: new LangGraphAgent({
      deploymentUrl,
      graphId: "sample_agent",
      langsmithApiKey,
    }),
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
  let selectedAgent;
  if (agentName === 'sudoku_agent') {
    selectedAgent = new LangGraphAgent({
      deploymentUrl,
      graphId: "sudoku_agent",
      langsmithApiKey,
    });
  } else if (agentName === 'chess_agent') {
    selectedAgent = new LangGraphAgent({
      deploymentUrl,
      graphId: "chess_agent",
      langsmithApiKey,
    });
  } else if (agentName === 'sample_agent') {
    selectedAgent = new LangGraphAgent({
      deploymentUrl,
      graphId: "sample_agent",
      langsmithApiKey,
    });
  } else {
    // Default to router_agent
    selectedAgent = new LangGraphAgent({
      deploymentUrl,
      graphId: "router_agent",
      langsmithApiKey,
    });
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
