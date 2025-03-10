from fastapi import APIRouter
from pydantic import BaseModel
from openai import OpenAI
import databutton as db

router = APIRouter()

class PropertySearchRequest(BaseModel):
    query: str

class PropertySearchResponse(BaseModel):
    properties: list[dict]
    suggested_filters: dict

@router.post("/property-search")
def search_properties2(body: PropertySearchRequest) -> PropertySearchResponse:
    """Search properties using natural language query"""
    try:
        # Initialize OpenAI client
        client = OpenAI(api_key=db.secrets.get("OPENAI_API_KEY"))

        # Create system message to define the task
        system_message = """
You are a luxury real estate search assistant for Ferola Private Brokers in Brasília.
Your task is to understand natural language property queries and extract key search parameters.
Focus on high-end properties in premium locations.

Output format should be a JSON with two sections:
1. filters: Extracted search parameters (location, type, features, etc.)
2. description: A brief summary of what you understood from the query in Brazilian Portuguese
"""

        # Get completion from OpenAI
        completion = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": f"Analyze this query and return JSON: {body.query}"}
            ]
        )

        # Parse the response
        import json
        try:
            ai_response = json.loads(completion.choices[0].message.content)
        except json.JSONDecodeError:
            ai_response = {
                "filters": {},
                "description": "Não foi possível processar a busca. Por favor, tente novamente."
            }

        # For now, return mock properties based on the query
        # This would be replaced with actual database queries
        mock_properties = [
            {
                "id": "1",
                "title": "Cobertura Duplex no Lago Sul",
                "description": "Luxuosa cobertura com vista panorâmica",
                "price": "R$ 8.500.000",
                "location": "Lago Sul",
                "area": "580m²",
                "bedrooms": 4,
                "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2940&auto=format&fit=crop"
            },
            {
                "id": "2",
                "title": "Mansão no Park Way",
                "description": "Propriedade exclusiva com área verde",
                "price": "R$ 12.000.000",
                "location": "Park Way",
                "area": "1200m²",
                "bedrooms": 5,
                "image": "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2940&auto=format&fit=crop"
            }
        ]

        return PropertySearchResponse(
            properties=mock_properties,
            suggested_filters=ai_response
        )

    except Exception as e:
        print(f"Error in property search: {str(e)}")
        # Return empty results on error
        return PropertySearchResponse(
            properties=[],
            suggested_filters={}
        )
