import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_pinecone import PineconeVectorStore
from langchain_pinecone import PineconeEmbeddings

load_dotenv()

_vectorstore = None
_llm = None

def get_vectorstore():
    global _vectorstore
    if _vectorstore is None:
        print("Connecting to Pinecone...")
        # Hosted by Pinecone so nothing heavy runs inside the Vercel function.
        embeddings = PineconeEmbeddings(model="multilingual-e5-large")
        _vectorstore = PineconeVectorStore.from_existing_index(
            index_name="dailydeals-e5",  # must match store_content_in_db.py
            embedding=embeddings
        )
    return _vectorstore

def get_llm():
    global _llm
    if _llm is None:
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        print("Loading LLM...")
        _llm = ChatGroq(
            model="openai/gpt-oss-20b",  # llama-3.1-8b-instant was retired by Groq
            api_key=groq_key
        )
    return _llm