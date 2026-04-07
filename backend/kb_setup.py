import json
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

def build_knowledge_base():
    print("Starting knowledge base setup...")
    docs = []

    faq_path = os.path.join(os.path.dirname(__file__), "data", "faqs.json")
    with open(faq_path, "r", encoding="utf-8") as f:
        faqs = json.load(f)

    for faq in faqs:
        text = f"Q: {faq['question']}\nA: {faq['answer']}"
        docs.append(Document(page_content=text))

    print(f"Loaded {len(faqs)} FAQs successfully!")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_documents(docs)
    print(f"Total chunks created: {len(chunks)}")

    print("Creating embeddings... (2-3 min lagenge pehli baar)")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vectorstore = FAISS.from_documents(chunks, embeddings)
    index_path = os.path.join(os.path.dirname(__file__), "faiss_index")
    vectorstore.save_local(index_path)

    print("=" * 40)
    print("Knowledge base built successfully!")
    print(f"FAISS index saved at: {index_path}")
    print("=" * 40)

if __name__ == "__main__":
    build_knowledge_base()