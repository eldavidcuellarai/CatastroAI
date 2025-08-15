#!/usr/bin/env python3
"""
Demo web simple para CatastroAI usando Streamlit
"""

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import uvicorn
import asyncio
import os
import sys
from pathlib import Path

# Agregar el directorio del proyecto al path
project_root = Path(__file__).parent
sys.path.append(str(project_root))

from customer_service.agent import root_agent

app = FastAPI()
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    user_message = data.get("message")
    
    response_content = ""
    
    async for chunk in root_agent.chat_stream(user_message):
        response_content += chunk
        
    return {"response": response_content}

def main():
    """Start the web server."""
    uvicorn.run("web_demo:app",
                host=os.getenv("HOST", "127.0.0.1"),
                port=int(os.getenv("PORT", "8080")),
                reload=True)

if __name__ == "__main__":
    main()