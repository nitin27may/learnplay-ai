"""
Text-to-Speech service using Eleven Labs API
"""

import os
import sys
import requests
import base64
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# Fix Windows console encoding issues
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass  # Ignore if reconfigure not available

class TTSService:
    """Service for generating speech from text using Eleven Labs"""
    
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        self.voice_id = os.getenv("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")
        self.base_url = "https://api.elevenlabs.io/v1"
        
        if not self.api_key:
            print("[WARNING] ELEVENLABS_API_KEY not set. TTS will be disabled.")
    
    def generate_speech(self, text: str) -> Optional[str]:
        """
        Generate speech from text and return base64 encoded audio.
        
        Args:
            text: The text to convert to speech
            
        Returns:
            Base64 encoded audio string, or None if generation failed
        """
        if not self.api_key:
            print("[WARNING] TTS disabled: No API key")
            return None
        
        if not text or len(text.strip()) == 0:
            return None
        
        try:
            url = f"{self.base_url}/text-to-speech/{self.voice_id}"
            
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.api_key
            }
            
            payload = {
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "output_format": "mp3_44100_128",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75
                }
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                # Encode audio as base64
                audio_base64 = base64.b64encode(response.content).decode('utf-8')
                print(f"[OK] Generated speech for: {text[:50]}...")
                return audio_base64
            else:
                print(f"[ERROR] Eleven Labs API error: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error details: {error_data}")
                except Exception:
                    print(f"   Response: {response.text[:200]}")
                return None
                
        except Exception as e:
            print(f"[ERROR] TTS generation error: {str(e)}")
            return None
    
    def is_available(self) -> bool:
        """Check if TTS service is available"""
        return self.api_key is not None

# Global TTS service instance
tts_service = TTSService()
