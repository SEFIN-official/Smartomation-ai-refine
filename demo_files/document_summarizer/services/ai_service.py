import logging
from groq import Groq
from openai import OpenAI
from config import settings

logger = logging.getLogger(__name__)

def get_summarization_prompt(text: str) -> str:
    return f"""
    Summarize the following document into a clean, visually appealing HTML format suitable for email.
    Keep it concise and highlight key points using headings, bullet points, and emphasis.

    Document:
    {text[:15000]}  # Truncate to avoid token limits
    """

async def summarize_document(text: str) -> str:
    """
    Summarizes the document text into HTML format using the configured LLM provider.
    """
    provider = settings.LLM_PROVIDER.lower()
    prompt = get_summarization_prompt(text)
    
    try:
        if provider == "groq":
            if not settings.GROQ_API_KEY:
                raise ValueError("GROQ_API_KEY not found in environment.")
            
            client = Groq(api_key=settings.GROQ_API_KEY)
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a professional assistant that generates HTML summaries of documents."},
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content

        elif provider == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY not found in environment.")
            
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a professional assistant that generates HTML summaries of documents."},
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content
        
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")
            
    except Exception as e:
        logger.error(f"Error in AI summarization: {str(e)}")
        raise Exception(f"AI summarization failed: {str(e)}")
