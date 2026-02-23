import os
import requests
import json


HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"


def analyze_prompt_with_llm(prompt, schema, sample_rows):
    """
    Sends structured dataset context + user prompt to Hugging Face LLM
    and returns raw string output.
    """

    # 🔐 Load API key from environment
    api_key = os.getenv("HUGGINGFACE_API_KEY")

    if not api_key:
        raise ValueError("HUGGINGFACE_API_KEY not found in environment variables.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    # 🧠 STRICT SYSTEM PROMPT
    system_prompt = f"""
You are a data visualization assistant.

Your job is to analyze structured dataset information and convert
natural language requests into a structured JSON visualization plan.

DATASET SCHEMA:
{json.dumps(schema, indent=2)}

SAMPLE ROWS:
{json.dumps(sample_rows, indent=2)}

USER REQUEST:
"{prompt}"

OUTPUT REQUIREMENTS:
- Return ONLY raw JSON.
- Do NOT include markdown formatting.
- Do NOT include ```json or backticks.
- Do NOT include explanations or conversational text.
- The output must strictly match this schema:

{{
  "type": "chart" | "table" | "summary",
  "blocks": [
    {{
      "title": "string",
      "chart_type": "bar" | "line" | "pie" | null,
      "x_axis": "string" | null,
      "y_axis": "string" | null,
      "aggregation": "sum" | "count" | "average" | null
    }}
  ],
  "warnings": []
}}

If the request cannot be fulfilled using the schema provided,
return a valid JSON response with warnings explaining why.
"""

    payload = {
        "inputs": system_prompt,
        "parameters": {
            "temperature": 0.2,
            "max_new_tokens": 500,
        }
    }

    response = requests.post(
        HF_API_URL,
        headers=headers,
        json=payload,
        timeout=60,
    )

    if response.status_code != 200:
        raise Exception(f"Hugging Face API Error: {response.text}")

    result = response.json()

    # HF returns list format usually
    if isinstance(result, list) and "generated_text" in result[0]:
        return result[0]["generated_text"]

    # fallback safety
    return str(result)