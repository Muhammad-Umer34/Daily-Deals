import os
import requests
from langchain_core.embeddings import Embeddings

class HuggingFaceInferenceEmbeddings(Embeddings):
    def __init__(self, model_name="BAAI/bge-large-en-v1.5"):
        self.api_url = f"https://api-inference.huggingface.co/models/{model_name}"
        self.headers = {}
        token = os.getenv("HUGGINGFACEHUB_API_TOKEN") or os.getenv("HF_TOKEN")
        if token:
            self.headers["Authorization"] = f"Bearer {token}"

    def embed_documents(self, texts):
        response = requests.post(
            self.api_url,
            headers=self.headers,
            json={"inputs": texts, "options": {"wait_for_model": True}}
        )
        if response.status_code == 200:
            res = response.json()
            if isinstance(res, dict) and "error" in res:
                raise Exception(f"HF embedding error: {res['error']}")
            return res
        else:
            raise Exception(f"HF embedding error {response.status_code}: {response.text}")

    def embed_query(self, text):
        response = requests.post(
            self.api_url,
            headers=self.headers,
            json={"inputs": text, "options": {"wait_for_model": True}}
        )
        if response.status_code == 200:
            res = response.json()
            if isinstance(res, dict) and "error" in res:
                raise Exception(f"HF embedding error: {res['error']}")
            if isinstance(res, list) and len(res) > 0 and isinstance(res[0], list):
                return res[0]
            return res
        else:
            raise Exception(f"HF embedding error {response.status_code}: {response.text}")
