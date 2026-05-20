from openai import OpenAI, OpenAIError

from app.core.config import settings


def _get_deepseek_client() -> OpenAI:
    if not settings.DEEPSEEK_API_KEY:
        raise ValueError(
            "DEEPSEEK_API_KEY is missing. Add it to your .env file before calling the AI."
        )

    return OpenAI(
        api_key=settings.DEEPSEEK_API_KEY,
        base_url=settings.DEEPSEEK_BASE_URL,
    )


def ask_deepseek(prompt: str) -> str:
    clean_prompt = prompt.strip()
    if not clean_prompt:
        raise ValueError("Prompt cannot be empty.")

    client = _get_deepseek_client()

    try:
        response = client.chat.completions.create(
            model=settings.DEEPSEEK_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a careful assistant that answers clearly and concisely.",
                },
                {"role": "user", "content": clean_prompt},
            ],
            temperature=0.2,
        )
    except OpenAIError as exc:
        raise RuntimeError(f"DeepSeek API request failed: {exc}") from exc

    answer = response.choices[0].message.content if response.choices else ""
    if not answer:
        raise RuntimeError("DeepSeek returned an empty response.")

    return answer.strip()
