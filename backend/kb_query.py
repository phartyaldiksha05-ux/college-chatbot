import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def get_answer(user_question: str) -> str:

    # Step 1 - Load FAISS index
    index_path = os.path.join(os.path.dirname(__file__), "faiss_index")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vectorstore = FAISS.load_local(
        index_path,
        embeddings,
        allow_dangerous_deserialization=True
    )

    # Step 2 - Search top 3 matching FAQs
    results = vectorstore.similarity_search(user_question, k=3)
    context = "\n\n".join([r.page_content for r in results])

    # Step 3 - Return context directly (Gemini API milne tak)
    return f"[FAISS Result]\n{context}"

    # Step 4 - Call Gemini API
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    return response.text

if __name__ == "__main__":
    print("Testing kb_query.py...")
    print("-" * 40)

    questions = [
        "Who is the director of GBPIET?",
        "What courses are available?",
        "How to pay fees?",
        "What is the contact number?"
    ]

    for q in questions:
        print(f"Q: {q}")
        print(f"A: {get_answer(q)}")
        print("-" * 40)