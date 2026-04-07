from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import uuid
from datetime import datetime
from typing import List, Optional
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from groq import Groq
from dotenv import load_dotenv
from backend.language_detector import detect_language

load_dotenv()

app = FastAPI(
    title="Diksha - GBPIET Chatbot",
    description="Multilingual Chatbot for GBPIET",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

WELCOME_EN = "Hello! My name is Diksha, and welcome to Govind Ballabh Pant Institute of Engineering and Technology. I am here to help you with any queries about GBPIET. Feel free to ask me anything!"
WELCOME_HI = "नमस्ते! मेरा नाम दीक्षा है, और आपका गोविंद बल्लभ पंत अभियान्त्रिकी एवं प्रौद्योगिकी संस्थान में स्वागत है। मैं GBPIET से जुड़े आपके किसी भी सवाल में मदद करने के लिए यहाँ हूँ!"

# Chat history store
chat_sessions = {}

vectorstore = None

@app.on_event("startup")
async def startup_event():
    global vectorstore
    print("Loading embeddings model... please wait")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": False}
    )
    index_path = os.path.join(os.path.dirname(__file__), "faiss_index")
    vectorstore = FAISS.load_local(
        index_path,
        embeddings,
        allow_dangerous_deserialization=True
    )
    print("Diksha is ready!")

class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = None
    is_first_message: bool = False

class ChatResponse(BaseModel):
    answer: str
    language: str
    session_id: str
    chatbot_name: str = "Diksha"

class HistoryResponse(BaseModel):
    session_id: str
    messages: List[dict]

@app.get("/")
def home():
    return {
        "chatbot": "Diksha",
        "college": "Govind Ballabh Pant Institute of Engineering and Technology",
        "status": "running",
        "message": "Welcome to GBPIET Chatbot API!"
    }

@app.get("/welcome")
def welcome():
    return {
        "chatbot": "Diksha",
        "message": WELCOME_EN,
        "message_hi": WELCOME_HI
    }

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    question = request.question
    lang = detect_language(question)

    # Session manage karo
    session_id = request.session_id or str(uuid.uuid4())
    if session_id not in chat_sessions:
        chat_sessions[session_id] = []

    # Welcome message
    if request.is_first_message:
        answer = WELCOME_HI if lang == "hi" else WELCOME_EN
        chat_sessions[session_id].append({
            "role": "user",
            "message": question,
            "language": lang,
            "timestamp": datetime.now().isoformat()
        })
        chat_sessions[session_id].append({
            "role": "diksha",
            "message": answer,
            "language": lang,
            "timestamp": datetime.now().isoformat()
        })
        return ChatResponse(
            answer=answer,
            language=lang,
            session_id=session_id
        )

    # FAISS search
    results = vectorstore.similarity_search(question, k=3)
    context = "\n\n".join([r.page_content for r in results])

    # Previous history
    history_text = ""
    if chat_sessions[session_id]:
        history_text = "Previous conversation:\n"
        for msg in chat_sessions[session_id][-6:]:
            role = "Student" if msg["role"] == "user" else "Diksha"
            history_text += f"{role}: {msg['message']}\n"

    # Language ke hisab se prompt
    if lang == "hi":
        prompt = f"""Aap Diksha hain — GBPIET (Govind Ballabh Pant Institute of
Engineering and Technology), Pauri Garhwal ke liye ek helpful chatbot.

STRICT RULES:
- HAMESHA Hindi mein jawab do
- Sirf neeche diye context ka use karo
- Agar answer nahi hai toh kaho:
  "Mujhe yeh jaankari nahi hai. Kripya GBPIET se sampark karein:
   01368-228030 ya director@gbpiet.ac.in"
- Jawab chhota aur clear rakho
- Friendly raho
- Apna naam Diksha batao agar pucha jaye

{history_text}

Context:
{context}

Sawaal: {question}
Jawab:"""

    else:
        prompt = f"""You are Diksha — a helpful chatbot for GBPIET
(Govind Ballabh Pant Institute of Engineering and Technology), Pauri Garhwal.

STRICT RULES:
- ALWAYS reply in English only
- Use ONLY the context below to answer
- If answer is not in context say:
  "I don't have that information. Please contact GBPIET at
   01368-228030 or director@gbpiet.ac.in"
- Keep answers short and clear
- Be friendly and helpful
- Tell your name is Diksha if asked

{history_text}

Context:
{context}

Question: {question}
Answer:"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are Diksha, a helpful multilingual chatbot for GBPIET college."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=500,
            temperature=0.7
        )
        answer = response.choices[0].message.content

    except Exception as e:
        print(f"Groq error: {e}")
        if results:
            answer = results[0].page_content.replace("Q:", "").replace("A:", "").strip()
            answer = answer.split("\n")[-1].strip()
        else:
            if lang == "hi":
                answer = "Kripya GBPIET se sampark karein: 01368-228030"
            else:
                answer = "Please contact GBPIET: 01368-228030"

    # History save karo
    chat_sessions[session_id].append({
        "role": "user",
        "message": question,
        "language": lang,
        "timestamp": datetime.now().isoformat()
    })
    chat_sessions[session_id].append({
        "role": "diksha",
        "message": answer,
        "language": lang,
        "timestamp": datetime.now().isoformat()
    })

    return ChatResponse(
        answer=answer,
        language=lang,
        session_id=session_id
    )

@app.get("/history/{session_id}", response_model=HistoryResponse)
def get_history(session_id: str):
    messages = chat_sessions.get(session_id, [])
    return HistoryResponse(
        session_id=session_id,
        messages=messages
    )

@app.get("/sessions")
def get_sessions():
    return {
        "total_sessions": len(chat_sessions),
        "session_ids": list(chat_sessions.keys())
    }