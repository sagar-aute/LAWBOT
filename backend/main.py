
from flask import Flask, request, jsonify
from flask_cors import CORS
import io
import os
from PyPDF2 import PdfReader
import openai
import numpy as np
import faiss
import logging

app = Flask(__name__)
CORS(app)

# Use environment variable for OpenAI API key
# app.config['OPENAI_API_KEY'] = os.environ.get('OPENAI_API_KEY')
app.config['OPENAI_API_KEY'] = ''
# Ensure API key is set
if not app.config['OPENAI_API_KEY']:
    raise ValueError("No OpenAI API key set. Please set the OPENAI_API_KEY environment variable.")

# Initialize logger
logging.basicConfig(level=logging.INFO)

# Global variables
index = None  # FAISS index
document_texts = []  # Store original text chunks for retrieval
chat_history = []

def get_pdf_text(pdf_bytes):
    text = ""
    pdf_reader = PdfReader(io.BytesIO(pdf_bytes))
    for page in pdf_reader.pages:
        text += page.extract_text() or ""  # Fallback to empty string if None
    return text

def get_text_chunks(text, chunk_size=1000, chunk_overlap=200):
    chunks = []
    start = 0
    end = chunk_size
    while start < len(text):
        if start > 0:
            start -= chunk_overlap
        chunks.append(text[start:end])
        start = end
        end += chunk_size
    return chunks

def get_embedding(text):
    openai.api_key = app.config['OPENAI_API_KEY']
    response = openai.Embedding.create(input=[text], engine="text-embedding-ada-002")
    embedding = response['data'][0]['embedding']
    return embedding

def create_faiss_index(text_chunks):
    global index, document_texts
    document_texts = text_chunks
    embeddings = [get_embedding(chunk) for chunk in text_chunks]
    d = len(embeddings[0])  # Dimension of embeddings
    index = faiss.IndexFlatL2(d)
    index.add(np.array(embeddings).astype('float32'))

def search_in_index(question, top_k=5):
    question_embedding = get_embedding(question)
    D, I = index.search(np.array([question_embedding]).astype('float32'), k=top_k)
    return [document_texts[i] for i in I[0]]

@app.route("/upload", methods=["POST"])
def upload():
    if 'pdf' not in request.files:
        return "No PDF file part", 400
    pdf_bytes = request.files['pdf'].read()

    try:
        text = get_pdf_text(pdf_bytes)
        text_chunks = get_text_chunks(text)
        create_faiss_index(text_chunks)
        return "Uploaded successfully!"
    except Exception as e:
        logging.error(f"Error processing PDF upload: {e}")
        return jsonify(error=str(e)), 500



@app.route("/chat", methods=["POST"])
def chat():
    if index is None:
        return jsonify(error="The vector store is not initialized."), 500

    user_question = request.form.get("question")
    if not user_question:
        return jsonify(error="No question provided."), 400

    try:
        relevant_texts = search_in_index(user_question)
        
        # Retrieve a single relevant text chunk to use for generating a response
        relevant_text_chunk = relevant_texts[0] if relevant_texts else ""

        # Concatenate user question and relevant text chunk
        prompt = f"User: {user_question}\nAssistant: {relevant_text_chunk}\n"
        
        # Generate response from OpenAI's GPT-3 model
        response = openai.Completion.create(
            engine="gpt-3.5-turbo-instruct", 
            prompt=prompt,
            max_tokens=50
        ).choices[0].text.strip()

        chat_history.append({"role": "user", "content": user_question})
        chat_history.append({"role": "assistant", "content": response})

        return jsonify(history=chat_history)
    except Exception as e:
        logging.error(f"Error in chat functionality: {e}")
        return jsonify(error=str(e)), 500

if __name__ == "__main__":
    app.run

