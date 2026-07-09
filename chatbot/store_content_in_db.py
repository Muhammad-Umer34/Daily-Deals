from embeddings import HuggingFaceInferenceEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document
from pinecone import Pinecone, ServerlessSpec, CloudProvider, AwsRegion
from dotenv import load_dotenv
import os
import time

# ======================
# 1️⃣ Load environment variables
# ======================
load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = "dailyeals"

# ======================
# 2️⃣ Initialize Pinecone client
# ======================
pc = Pinecone(api_key=PINECONE_API_KEY)

# ======================
# 3️⃣ Create index if it doesn't exist
# ======================
print("📋 Checking indexes...")
indexes = pc.list_indexes()
index_names = [idx.name for idx in indexes]

if PINECONE_INDEX_NAME not in index_names:
    print(f"📦 Creating index '{PINECONE_INDEX_NAME}'...")
    pc.create_index(
        name=PINECONE_INDEX_NAME,
        dimension=1024,  # BAAI/bge-large-en-v1.5 uses 1024 dimensions
        metric="cosine",
        spec=ServerlessSpec(
            cloud=CloudProvider.AWS,
            region=AwsRegion.US_EAST_1  # Adjust region if needed (e.g., AwsRegion.US_WEST_2)
        )
    )
    print("⏳ Waiting for index to be ready...")
    time.sleep(10)
else:
    print(f"✅ Index '{PINECONE_INDEX_NAME}' already exists")

# ======================
# 4️⃣ Initialize embedding model (1024 dimensions)
# ======================
print("🤖 Loading embedding model...")
embeddings = HuggingFaceInferenceEmbeddings(model_name="BAAI/bge-large-en-v1.5")

# ======================
# 5️⃣ Your store information
# ======================
store_text = """
### 🏷️ **About Daily Deals**

Welcome to **Daily Deals**, your one-stop destination for trendy, high-quality, and affordable fashion.
We believe that looking good should never come with a high price tag — that's why we bring you **daily discounts**, **limited-time offers**, and **exclusive collections** that keep you stylish all year round.

Our catalog includes a wide range of clothing for **men, women, and kids**, including:

* Casual wear 👕
* Formal and office wear 👔
* Ethnic and festive outfits 👗
* Hoodies, jackets, and sweatshirts 🧥
* Footwear and fashion accessories 👟👜

We constantly update our collections to keep up with the latest trends, ensuring that our customers always have something fresh and exciting to explore.

---

### 💬 **Our Mission**

At **Daily Deals**, our mission is to make fashion accessible and affordable for everyone.
We focus on providing **quality**, **comfort**, and **value** in every product we sell.

---

### 🚚 **Delivery Policy**

We deliver **nationwide across Pakistan**, right to your doorstep.

**Delivery Time:**
* Major cities: **3–5 working days**
* Other areas: **5–7 working days**

**Delivery Charges:**
* Orders above **PKR 2,000** → **Free Delivery**
* Orders below **PKR 2,000** → **PKR 200 delivery fee**

---

### 💳 **Payment Methods**

* **Cash on Delivery (COD)** – Pay when your order arrives.
* **Online Payment** – Coming soon via credit/debit card or JazzCash/Easypaisa.
* **Discount Codes** – Apply promo codes during checkout for additional discounts.

---

### 🔁 **Exchange & Return Policy**

**You can request an exchange or return within 7 days** if:
* The product is unused and original packaging.
* Tags and labels are intact.
* You received a damaged, defective, or incorrect item.

Contact: **support@dailydeals.pk**

---

### 📦 **Order Tracking**

After placing an order, you'll receive a confirmation email or SMS with your **Order ID**.
Use this to track your package anytime.

---

### 🤝 **Customer Support**

* 📧 Email: **support@dailydeals.pk**
* 💬 Chat: via our website or chatbot
* ⏰ Support hours: **Monday to Saturday, 10 AM – 8 PM**

---

### 🧠 **Chatbot Purpose**

This chatbot is your **Daily Deals Virtual Shopping Assistant** here to:
* Tell you about store policies
* Guide you through the order process
* Share ongoing deals and offers
* Answer FAQs about shipping, returns, and payments
"""

# ======================
# 6️⃣ Create document and embed it
# ======================
print("📝 Creating document...")
docs = [Document(page_content=store_text, metadata={"source": "store_info"})]

# ======================
# 7️⃣ Store embeddings in Pinecone
# ======================
print("🔄 Embedding and uploading to Pinecone...")
index = pc.Index(PINECONE_INDEX_NAME)
vectorstore = PineconeVectorStore(
    index=index,
    embedding=embeddings
)
vectorstore.add_documents(docs)

print("✅ Store information successfully embedded and stored in Pinecone!")
print(f"📌 Index: {PINECONE_INDEX_NAME}")
print("🎉 Your knowledge base is ready for the chatbot!")