from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain.schema import Document as LC_Document

def embed_chunks(chunks: list[str], doc_id: str, agent_id: str):
    docs = [LC_Document(page_content=c, metadata={"agent_id": agent_id, "doc_id": doc_id}) for c in chunks]
    vectorstore = Chroma(collection_name="agent_store", embedding_function=OllamaEmbeddings(model="llama3", base_url="http://backend-ollama-1:11434"))
    vectorstore.add_documents(docs)
