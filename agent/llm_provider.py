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
    Optimized for low latency and good teaching quality.
    """
    provider = os.getenv("LLM_PROVIDER", "openai").lower()
    
    # Lower temperature for more consistent teaching responses
    # Default to gpt-4o-mini for faster responses
    default_temperature = float(os.getenv("LLM_TEMPERATURE", "0.3"))
    
    if provider == "openai":
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")  # Faster default
        return ChatOpenAI(
            model=model,
            temperature=default_temperature,
            max_tokens=int(os.getenv("LLM_MAX_TOKENS", "1000")),  # Limit for speed
            streaming=True,  # Enable streaming for perceived speed
        )
    
    elif provider == "azure-openai":
        return AzureChatOpenAI(
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            azure_deployment=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
            api_version="2024-02-15-preview",
            temperature=default_temperature,
            max_tokens=int(os.getenv("LLM_MAX_TOKENS", "1000")),
            streaming=True,
        )
    
    elif provider == "anthropic":
        return ChatAnthropic(
            model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022"),
            temperature=default_temperature,
            max_tokens=int(os.getenv("LLM_MAX_TOKENS", "1000")),
        )
    
    elif provider == "ollama":
        from langchain_ollama import ChatOllama
        return ChatOllama(
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
            model=os.getenv("OLLAMA_MODEL", "llama3.1:8b"),
            temperature=default_temperature,
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
