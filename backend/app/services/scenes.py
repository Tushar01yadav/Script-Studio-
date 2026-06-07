import json
import httpx
from app.core.config import settings

async def generate_scene_plan(script: str) -> str:
    if not settings.MISTRAL_API_KEY or settings.MISTRAL_API_KEY == "placeholdermistral":
        # Return a mock output for development / local fallback
        mock_scenes = [
            {
                "scene_number": 1,
                "duration": "0:15",
                "narration": "Welcome back to another amazing video. Today we are talking about YouTube Script Studio.",
                "visual": "A vibrant digital office dashboard displaying analytic charts and waveforms.",
                "image_prompt": "Cinematic photo of a modern dark-themed futuristic creator desk, neon highlights, 3D analytical screens, 8k resolution, photorealistic"
            },
            {
                "scene_number": 2,
                "duration": "0:20",
                "narration": "This tool streamlines your workflow by combining transcripts, AI scripts, voiceovers, and scene plans in one place.",
                "visual": "An illustrative workflow connecting a video camera, artificial brain, microphone, and image frames.",
                "image_prompt": "Minimalist isometric conceptual illustration representing full-stack automation, glowing lines connecting digital nodes, high quality vector render"
            }
        ]
        return json.dumps(mock_scenes)

    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.MISTRAL_API_KEY}"
    }

    prompt = (
        "Analyze the following script and split it into logical scenes suitable for a YouTube slideshow video.\n"
        "Return the response ONLY as a valid JSON array of objects. Do not include any conversational text, markdown formatting, or HTML.\n\n"
        "Format each scene object in the JSON array to have exactly these keys:\n"
        "- \"scene_number\": (integer) The sequence number of the scene\n"
        "- \"duration\": (string, e.g., '0:10') Estimated duration for this scene\n"
        "- \"narration\": (string) The narration script text to be spoken in this scene\n"
        "- \"visual\": (string) Visual description of what is shown on screen\n"
        "- \"image_prompt\": (string) Extremely detailed prompt optimized for AI image generators (Midjourney/Stable Diffusion)\n\n"
        f"Script:\n{script}"
    )

    data = {
        "model": "mistral-large-latest",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "response_format": {"type": "json_object"}
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=data, headers=headers, timeout=60.0)
            if response.status_code != 200:
                raise Exception(f"Mistral API error: {response.text}")
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            # Ensure it is a valid JSON string (it could be nested inside a dictionary with a key if the model output a single JSON object)
            try:
                parsed = json.loads(content)
                if isinstance(parsed, dict) and "scenes" in parsed:
                    return json.dumps(parsed["scenes"])
                return json.dumps(parsed)
            except Exception:
                return content
        except Exception as e:
            raise Exception(f"Failed to generate scene plan from Mistral: {str(e)}")
