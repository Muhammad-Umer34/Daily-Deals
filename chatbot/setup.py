import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_pinecone import PineconeVectorStore
from embeddings import HuggingFaceInferenceEmbeddings

load_dotenv()

_vectorstore = None
_llm = None

def get_vectorstore():
    global _vectorstore
    if _vectorstore is None:
        print("Connecting to Pinecone...")
        embeddings = HuggingFaceInferenceEmbeddings(model_name="BAAI/bge-large-en-v1.5")
        _vectorstore = PineconeVectorStore.from_existing_index(
            index_name="dailyeals",
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
            model="llama-3.1-8b-instant",
            api_key=groq_key
        )
    return _llm