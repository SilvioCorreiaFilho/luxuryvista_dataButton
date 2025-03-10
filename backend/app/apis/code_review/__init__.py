# import logging - Not available in Databutton environment
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from anthropic import Anthropic
from anthropic.types import MessageParam
import databutton as db
from time import sleep

# Configure simple logging replacement
def logger_info(msg):
    print(f"INFO: {msg}")

def logger_error(msg):
    print(f"ERROR: {msg}")

def logger_warning(msg):
    print(f"WARNING: {msg}")

# Router configuration
router = APIRouter(
    tags=["code_review"]
)

# Constants
MAX_RETRIES = 3
INITIAL_DELAY = 0.5  # 500ms
MAX_DELAY = 4  # Maximum delay in seconds

# Custom exceptions
class CodeReviewError(Exception):
    """Raised when code review fails"""
    pass

class AnthropicKeyError(Exception):
    """Raised when Anthropic API key is missing or invalid"""
    pass

class CodeReviewRequest(BaseModel):
    code: str
    context: str | None = None

class CodeReviewResponse(BaseModel):
    review: str
    suggestions: list[str]

def get_chat_completion(messages: list[dict[str, str]]) -> str:
    """Get chat completion from Claude with proper error handling"""
    try:
        api_key = db.secrets.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise AnthropicKeyError("Anthropic API key not found")
            
        client = Anthropic(api_key=api_key)
        
        # Convert messages to Anthropic format
        system_message = next((m["content"] for m in messages if m["role"] == "system"), "")
        user_message = next((m["content"] for m in messages if m["role"] == "user"), "")
        
        # Debug log for request
        logger_info("Sending request to Claude")
        logger_info(f"System message: {system_message}")
        logger_info(f"User message: {user_message}")
        
        try:
            message = client.messages.create(
                model="claude-3-7-sonnet-20250219",
                max_tokens=2000,
                temperature=0.7,
                system=system_message,
                messages=[{
                    "role": "user",
                    "content": user_message
                }]
            )
            
            # Debug log for response
            logger_info(f"Claude response: {message}")
            
            if not message.content or not message.content[0].text:
                logger_error("Invalid response from Claude: missing content")
                raise CodeReviewError("Invalid response from code review service")
                
            return message.content[0].text
        except Exception as api_error:
            logger_error(f"Claude API error: {str(api_error)}")
            raise CodeReviewError(f"Claude API error: {str(api_error)}") from api_error
    except Exception as e:
        logger_error(f"Unexpected error in Claude call: {str(e)}")
        raise CodeReviewError(f"Unexpected error: {str(e)}") from e

def review_code_with_openai(code: str, context: Optional[str] = None) -> tuple[str, list[str]]:
    """Review code using OpenAI's GPT model with retry logic"""
    try:
        # Create the prompt
        prompt = f"""Please review the following code and provide a detailed analysis. Focus on:
        1. Code quality and best practices
        2. Potential bugs or issues
        3. Performance considerations
        4. Security concerns
        5. Suggestions for improvement

        Additional context: {context if context else 'No additional context provided'}

        Code to review:
        ```
        {code}
        ```
        """

        messages = [
            {"role": "system", "content": "You are an expert code reviewer with deep knowledge of React, TypeScript, and Python. You provide detailed, actionable feedback to help developers improve their code."},
            {"role": "user", "content": prompt}
        ]

        delay = INITIAL_DELAY
        last_error: Optional[Exception] = None

        for attempt in range(MAX_RETRIES):
            try:
                review = get_chat_completion(messages)
                
                # Split the review into sections
                sections = review.split('\n')
                suggestions = [s.strip('- ') for s in sections if s.startswith('-') or s.startswith('*')]
                
                return review, suggestions

            except CodeReviewError as e:
                last_error = e
                logger_warning(
                    f"Code review attempt {attempt + 1}/{MAX_RETRIES} failed: {str(e)}"
                )
                
                if attempt < MAX_RETRIES - 1:
                    sleep(min(delay, MAX_DELAY))
                    delay *= 2
                else:
                    raise

        raise CodeReviewError(f"Failed after {MAX_RETRIES} attempts: {str(last_error)}")
    except Exception as e:
        logger_error(f"Code review failed: {str(e)}")
        raise CodeReviewError("Code review failed") from e

@router.post("/review_code")
def review_code(request: CodeReviewRequest) -> CodeReviewResponse:
    """Review code using OpenAI's GPT model with retry logic"""
    try:
        # Handle empty code
        if not request.code.strip():
            return CodeReviewResponse(
                review="No code provided for review.",
                suggestions=["Please provide code to review."]
            )

        review, suggestions = review_code_with_openai(
            code=request.code,
            context=request.context
        )

        return CodeReviewResponse(
            review=review,
            suggestions=suggestions if suggestions else ["No specific suggestions provided"]
        )

    except CodeReviewError as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) from e
    except Exception as e:
        logger_error(f"Unexpected error in code review endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during code review"
        ) from e
