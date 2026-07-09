import os
from huggingface_hub import InferenceClient
from langchain_core.embeddings import Embeddings

class HuggingFaceInferenceEmbeddings(Embeddings):
    def __init__(self, model_name="BAAI/bge-large-en-v1.5"):
        self.model_name = model_name
        token = os.getenv("HUGGINGFACEHUB_API_TOKEN") or os.getenv("HF_TOKEN")
        self.client = InferenceClient(token=token)

    def embed_documents(self, texts):
        try:
            res = self.client.feature_extraction(texts, model=self.model_name)
            if hasattr(res, "tolist"):
                return res.tolist()
            return res
        except Exception as e:
            # Fallback to single text embeddings if batch fails
            embeddings = []
            for text in texts:
                embeddings.append(self.embed_query(text))
            return embeddings

    def embed_query(self, text):
        res = self.client.feature_extraction(text, model=self.model_name)
        if hasattr(res, "tolist"):
            res = res.tolist()
        if isinstance(res, list) and len(res) > 0 and isinstance(res[0], list):
            return res[0]
        return res
