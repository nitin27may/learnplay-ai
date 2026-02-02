"""
Voice-enabled tools that generate audio for frontend playback
"""

from typing import Dict, Any
from langchain.tools import tool
from tts_service import tts_service

@tool
def speak_message(message: str) -> Dict[str, Any]:
    """
    Generate speech audio for a message using Eleven Labs TTS.
    The audio will be played automatically on the frontend.
    
    Args:
        message: The text message to speak
        
    Returns:
        Dictionary with audio data and status
    """
    if not message or len(message.strip()) == 0:
        return {
            "success": False,
            "error": "Empty message"
        }
    
    if not tts_service.is_available():
        return {
            "success": False,
            "error": "TTS service not available",
            "message": message
        }
    
    audio_base64 = tts_service.generate_speech(message)
    
    if audio_base64:
        return {
            "success": True,
            "audio": audio_base64,
            "message": message,
            "format": "audio/mpeg"
        }
    else:
        return {
            "success": False,
            "error": "Failed to generate audio",
            "message": message
        }
