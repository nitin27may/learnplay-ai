"""
Multi-LLM provider support for the agent.
Supports OpenAI, Azure OpenAI, Anthropic, and Ollama.
"""

import os
from typing import Any, Dict
from langchain_openai import ChatOpenAI, AzureChatOpenAI
from langchain_anthropic import ChatAnthropic

def get_llm_provider():
    """
    Get the configured LLM provider based on environment variables.
    """
    provider = os.getenv("LLM_PROVIDER", "openai").lower()
    
    if provider == "openai":
        return ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o"),
            temperature=0.7
        )
    
    elif provider == "azure-openai":
        return AzureChatOpenAI(
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            azure_deployment=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
            api_version="2024-02-15-preview",
            temperature=0.7
        )
    
    elif provider == "anthropic":
        return ChatAnthropic(
            model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022"),
            temperature=0.7
        )
    
    elif provider == "ollama":
        from langchain_ollama import ChatOllama
        return ChatOllama(
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
            model=os.getenv("OLLAMA_MODEL", "llama3.1:8b"),
            temperature=0.7
        )
    
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")

def get_provider_info() -> Dict[str, Any]:
    """
    Get information about the current LLM provider configuration.
    """
    provider = os.getenv("LLM_PROVIDER", "openai").lower()
    
    info = {
        "provider": provider,
        "model": None,
        "endpoint": None
    }
    
    if provider == "openai":
        info["model"] = os.getenv("OPENAI_MODEL", "gpt-4o")
    elif provider == "azure-openai":
        info["model"] = os.getenv("AZURE_OPENAI_DEPLOYMENT")
        info["endpoint"] = os.getenv("AZURE_OPENAI_ENDPOINT")
    elif provider == "anthropic":
        info["model"] = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    elif provider == "ollama":
        info["model"] = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
        info["endpoint"] = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    
    return info
