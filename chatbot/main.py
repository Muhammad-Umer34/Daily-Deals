from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from qa_chain import retrieval_chain, summary_chain

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    query: str

@app.post("/ask")
async def ask_question(request: Question):
    query = request.query
    
    print(f"\n--- NEW REQUEST ---")
    print(f"Question: {query}")
    
    try:
        # Get answer from retrieval
        print(f"Searching documents...")
        result = retrieval_chain.invoke({"query": query})
        raw_answer = result["result"]
        print(f"Raw Answer: {raw_answer}")
        
        # Make it simple
        print(f"Simplifying answer...")
        final_answer = summary_chain.invoke({"answer": raw_answer})
        print(f"Final Answer: {final_answer}")
        print(f"--- END REQUEST ---\n")
        
        return {
            "question": query,
            "answer": final_answer
        }
    
    except Exception as e:
        print(f"ERROR: {e}\n")
        return {"error": str(e)}

@app.get("/")
async def root():
    return {"message": "Daily Deals Chatbot API is running!"}

@app.get("/health")
async def health():
    return {"status": "ok"}