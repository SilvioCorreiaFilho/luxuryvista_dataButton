"""Code review API to detect and fix common issues in the LuxuryVista app."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import traceback
import re
import databutton as db

# Create router
router = APIRouter(prefix="/review-code", tags=["utils"])

# Import utilities from common_imports module for safe dynamic imports
try:
    from ..common_imports import import_function_safely, get_openai_client
except ImportError:
    print("Could not import from common_imports, using fallback implementations")
    # Fallback implementations if imports fail
    def import_function_safely(module_path, function_name):
        """Safely import a function from a module"""
        try:
            module_parts = module_path.split('.')
            current_module = __import__(module_parts[0])
            
            for part in module_parts[1:]:
                current_module = getattr(current_module, part)
                
            return getattr(current_module, function_name)
        except (ImportError, AttributeError):
            return None
        
    def get_openai_client():
        """Get an OpenAI client instance"""
        try:
            from openai import OpenAI
            api_key = db.secrets.get("OPENAI_API_KEY")
            if not api_key:
                print("OpenAI API key not found in secrets")
                return None
            return OpenAI(api_key=api_key)
        except Exception as e:
            print(f"Error initializing OpenAI client: {e}")
            return None

class ReviewCodeRequest(BaseModel):
    """Request model for code review"""
    code: str = Field(..., description="Code to review")
    language: str = Field("typescript", description="Programming language of the code")
    fix: bool = Field(False, description="Whether to return fixed code")

class ReviewCodeResponse(BaseModel):
    """Response model for code review"""
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Status message")
    issues: List[str] = Field(default_factory=list, description="List of issues found in the code")
    fixed_code: Optional[str] = Field(None, description="Fixed code")
    error: Optional[str] = Field(None, description="Error message if any")

@router.post("/review", response_model=ReviewCodeResponse, operation_id="review_code")
async def review_code(request: ReviewCodeRequest) -> ReviewCodeResponse:
    """Review code for issues and optionally fix them.
    
    This endpoint uses OpenAI to analyze code for issues and optionally suggest fixes.
    
    Args:
        request: Review request with code and options
    """
    try:
        # Get OpenAI client
        openai_client = get_openai_client()
        if not openai_client:
            return ReviewCodeResponse(
                success=False,
                message="OpenAI client initialization failed",
                issues=[],
                error="OpenAI client initialization failed"
            )
        
        # Prepare system prompt based on language
        language_specific_hints = {
            "typescript": "Look for React best practices, avoid duplicate imports, and ensure proper TypeScript typing. Check for issues with Zustand stores and React hooks.",
            "javascript": "Look for React best practices, avoid duplicate imports, and ensure proper event handling. Check for issues with state management and React hooks.",
            "python": "Look for circular imports, ensure proper error handling, and check for improper API usage. Ensure consistent function naming and docstrings."
        }
        
        language = request.language.lower()
        language_hint = language_specific_hints.get(language, "")
        
        system_prompt = f"""You are a senior software engineer specializing in code review for {language}. 
        Review the provided code and identify issues, bugs, anti-patterns, and style problems.
        {language_hint}
        
        Focus on the following categories of issues:
        1. Logical bugs and errors
        2. Performance issues
        3. Security vulnerabilities
        4. Code style and readability
        5. Architecture and design problems
        6. {language.capitalize()}-specific best practices
        
        DO NOT comment on minor style issues like indentation or nitpicks. Focus on substantive problems."""
        
        # First pass: Review the code for issues
        review_prompt = f"""Review this {language} code and list all issues you find:
        
        ```{language}
        {request.code}
        ```
        
        List each distinct issue as a separate point. If no serious issues are found, just say 'No significant issues found.'"""
        
        completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.2,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": review_prompt}
            ]
        )
        
        review_result = completion.choices[0].message.content
        
        # Parse the issues from the review result
        issues = []
        for line in review_result.split("\n"):
            line = line.strip()
            if line and (line.startswith("-") or re.match(r"^\d+\.", line)):
                # Extract the issue text (remove bullet/number prefix)
                issue_text = re.sub(r"^(-|\d+\.)(\s*)", "", line).strip()
                if issue_text:
                    issues.append(issue_text)
        
        if not issues and "No significant issues found" not in review_result:
            # If no bulleted issues were found, but it's not explicitly saying there are no issues,
            # then use the entire response as a single issue
            issues = [review_result.strip()]
        
        # If no fix requested, return just the issues
        if not request.fix:
            return ReviewCodeResponse(
                success=True,
                message="Code review completed successfully",
                issues=issues
            )
        
        # Second pass: Fix the code if requested
        fix_prompt = f"""I need you to fix the following {language} code based on the issues identified in your review:
        
        ```{language}
        {request.code}
        ```
        
        Here are the issues you identified:
        {' '.join(['- ' + issue for issue in issues])}
        
        Please provide the FULL corrected code. Do not omit any parts with comments like 'rest of the code remains the same'.
        Do not include any explanations, just return the fixed code."""
        
        completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.2,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": fix_prompt}
            ]
        )
        
        fix_result = completion.choices[0].message.content
        
        # Extract the fixed code, removing code block markers if present
        fixed_code = fix_result.strip()
        fixed_code = re.sub(r"```[a-zA-Z]*\n", "", fixed_code)
        fixed_code = fixed_code.rstrip("`")
        
        return ReviewCodeResponse(
            success=True,
            message="Code reviewed and fixed successfully",
            issues=issues,
            fixed_code=fixed_code
        )
        
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error in review_code: {e}\nStack trace: {error_details}")
        return ReviewCodeResponse(
            success=False,
            message=f"Error reviewing code: {str(e)}",
            issues=[],
            error=str(e)
        )

@router.post("/review2", response_model=ReviewCodeResponse, operation_id="review_code2")
async def review_code2(request: ReviewCodeRequest) -> ReviewCodeResponse:
    """Alternative code review endpoint for compatibility.
    
    This endpoint is the same as /review but with a different URL for backward compatibility.
    
    Args:
        request: Review request with code and options
    """
    return await review_code(request)