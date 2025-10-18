from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from dotenv import load_dotenv
import os

load_dotenv()

print("Loading embeddings...")
embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-large-en-v1.5")

print("Connecting to Pinecone...")
vectorstore = PineconeVectorStore.from_existing_index(
    index_name="dailyeals",
    embedding=embeddings
)

print("Loading LLM...")
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=os.getenv("GROQ_API_KEY")
)

print("Setup complete!\n")