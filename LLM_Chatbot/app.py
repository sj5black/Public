import streamlit as st
import os
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any
import pandas as pd
from dotenv import load_dotenv
load_dotenv()

# RAG 관련 imports
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.schema import Document
import tempfile

# API 키 설정
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    st.error("OpenAI API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.")
    st.stop()
    
# Streamlit 페이지 설정
st.set_page_config(
    page_title="문서검색 도우미 챗봇",
    page_icon="",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 세션 상태 초기화
if 'chat_sessions' not in st.session_state:
    st.session_state.chat_sessions = {}
if 'current_session_id' not in st.session_state:
    st.session_state.current_session_id = None
if 'vectorstore' not in st.session_state:
    st.session_state.vectorstore = None
if 'conversation_chain' not in st.session_state:
    st.session_state.conversation_chain = None
if 'uploaded_docs' not in st.session_state:
    st.session_state.uploaded_docs = []


class ChatSession:
    def __init__(self, session_id: str, name: str):
        self.session_id = session_id
        self.name = name
        self.messages = []
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    def add_message(self, role: str, content: str, sources: List[str] = None):
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "sources": sources or []
        }
        self.messages.append(message)
        self.updated_at = datetime.now()
    
    def to_dict(self):
        return {
            "session_id": self.session_id,
            "name": self.name,
            "messages": self.messages,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

def load_sessions():
    """저장된 세션들을 로드"""
    sessions_file = "chat_sessions.json"
    if os.path.exists(sessions_file):
        try:
            with open(sessions_file, 'r', encoding='utf-8') as f:
                sessions_data = json.load(f)
            
            sessions = {}
            for session_data in sessions_data:
                session = ChatSession(
                    session_data['session_id'],
                    session_data['name']
                )
                session.messages = session_data['messages']
                session.created_at = datetime.fromisoformat(session_data['created_at'])
                session.updated_at = datetime.fromisoformat(session_data['updated_at'])
                sessions[session.session_id] = session
            
            return sessions
        except Exception as e:
            st.error(f"세션 로드 중 오류: {e}")
            return {}
    return {}

def save_sessions():
    """세션들을 파일에 저장"""
    sessions_file = "chat_sessions.json"
    try:
        sessions_data = [session.to_dict() for session in st.session_state.chat_sessions.values()]
        with open(sessions_file, 'w', encoding='utf-8') as f:
            json.dump(sessions_data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        st.error(f"세션 저장 중 오류: {e}")

def create_new_session():
    """새로운 채팅 세션 생성"""
    session_id = str(uuid.uuid4())
    session_name = f"세션 {len(st.session_state.chat_sessions) + 1}"
    new_session = ChatSession(session_id, session_name)
    st.session_state.chat_sessions[session_id] = new_session
    st.session_state.current_session_id = session_id
    save_sessions()
    return session_id

# 1. 데이터 로드
def load_documents(uploaded_files):
    """업로드된 파일들을 문서로 변환"""
    documents = []
    
    for uploaded_file in uploaded_files:
        # 임시 파일로 저장
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{uploaded_file.name.split('.')[-1]}") as tmp_file:
            tmp_file.write(uploaded_file.read())
            tmp_file_path = tmp_file.name
        
        try:
            if uploaded_file.name.endswith('.pdf'):
                loader = PyPDFLoader(tmp_file_path)
                docs = loader.load()
            elif uploaded_file.name.endswith('.txt'):
                # 여러 인코딩을 시도해보기
                encodings = ['utf-8', 'cp949', 'euc-kr', 'latin-1']
                docs = None
                
                for encoding in encodings:
                    try:
                        # 파일이 실제로 존재하는지 확인
                        if not os.path.exists(tmp_file_path):
                            st.error(f"임시 파일이 생성되지 않았습니다: {tmp_file_path}")
                            break
                            
                        loader = TextLoader(tmp_file_path, encoding=encoding)
                        docs = loader.load()
                        st.success(f"파일 '{uploaded_file.name}'을 {encoding} 인코딩으로 성공적으로 로드했습니다.")
                        break
                    except UnicodeDecodeError:
                        continue
                    except Exception as e:
                        st.warning(f"인코딩 {encoding}으로 파일을 읽을 수 없습니다: {e}")
                        continue
                
                if docs is None:
                    st.error(f"파일 '{uploaded_file.name}'의 인코딩을 인식할 수 없습니다.")
                    continue
            else:
                st.warning(f"지원하지 않는 파일 형식: {uploaded_file.name}")
                continue
            
            # 문서에 메타데이터 추가
            for doc in docs:
                doc.metadata['source'] = uploaded_file.name
            
            documents.extend(docs)
            
        except Exception as e:
            st.error(f"파일 '{uploaded_file.name}' 처리 중 오류: {e}")
        finally:
            # 임시 파일 삭제
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
    
    return documents

# 2 to 4. 데이터 분할 + 임베딩 + 벡터DB 저장
def create_vectorstore(documents):
    """문서들로부터 벡터 스토어 생성"""
    if not documents:
        return None
    
    # 2. 텍스트 분할
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    
    chunks = text_splitter.split_documents(documents)
    
    # 3. 임베딩 생성
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    
    # 4. FAISS 벡터 스토어 생성 후 저장
    vectorstore = FAISS.from_documents(chunks, embeddings)
    
    return vectorstore

# 5. LangChain 생성
def create_conversation_chain(vectorstore, openai_api_key):
    """대화형 검색 체인 생성"""
    if not vectorstore:
        return None
    
    llm = ChatOpenAI(
        model="gpt-4-turbo-preview",
        temperature=0.7,
        openai_api_key=openai_api_key
    )
    
    # 메모리 설정
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        output_key="answer"
    )
    
    # 대화형 검색 체인 생성
    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
        memory=memory,
        return_source_documents=True,
        verbose=True
    )
    
    return conversation_chain

def sync_memory_with_session(conversation_chain, chat_session):
    """세션에 저장된 메시지를 LangChain 메모리에 반영"""
    if not conversation_chain or not chat_session:
        return
    
    memory = conversation_chain.memory
    memory.clear()  # 기존 메모리 초기화
    
    for msg in chat_session.messages:
        if msg["role"] == "user":
            memory.chat_memory.add_user_message(msg["content"])
        elif msg["role"] == "assistant":
            memory.chat_memory.add_ai_message(msg["content"])
            
def main():
    st.title("📚 RAG 문서 챗봇")
    st.markdown("PDF/TXT 문서를 업로드하고 질문해보세요!")
    
    # 사이드바 - 세션 관리
    with st.sidebar:
        st.header("💬 채팅 세션")
        
        # 세션 로드
        if not st.session_state.chat_sessions:
            st.session_state.chat_sessions = load_sessions()
        
        # 새 세션 생성 버튼
        if st.button("🆕 새 세션 생성"):
            create_new_session()
            st.rerun()
        
        # 기존 세션 목록
        if st.session_state.chat_sessions:
            st.subheader("기존 세션")
            for session_id, session in st.session_state.chat_sessions.items():
                col1, col2 = st.columns([3, 1])
                with col1:
                    if st.button(
                        f"{session.name} ({len(session.messages)})",
                        key=f"session_{session_id}",
                        use_container_width=True
                    ):
                        st.session_state.current_session_id = session_id
                        # 🔑 대화 히스토리 복원
                        sync_memory_with_session(st.session_state.conversation_chain, st.session_state.chat_sessions[session_id])
                        st.rerun()
                with col2:
                    if st.button("🗑️", key=f"delete_{session_id}"):
                        del st.session_state.chat_sessions[session_id]
                        if st.session_state.current_session_id == session_id:
                            st.session_state.current_session_id = None
                        save_sessions()
                        st.rerun()
        
        st.divider()
        
        # 문서 업로드
        st.subheader("📄 관련 문서")
        uploaded_files = st.file_uploader(
            "PDF 또는 TXT 파일을 업로드하세요",
            type=['pdf', 'txt'],
            accept_multiple_files=True
        )
        
        if uploaded_files:
            if st.button("문서 업로드"):
                with st.spinner("업로드한 문서를 학습하고 있습니다..."):
                    # 문서 로드
                    documents = load_documents(uploaded_files)
                    st.session_state.uploaded_docs = [f.name for f in uploaded_files]
                    
                    if documents:
                        # 벡터 스토어 생성
                        vectorstore = create_vectorstore(documents)
                        st.session_state.vectorstore = vectorstore
                        
                        # 대화 체인 생성
                        conversation_chain = create_conversation_chain(vectorstore, openai_api_key)
                        st.session_state.conversation_chain = conversation_chain
                        
                        st.success(f"✅ {len(documents)}개의 문서가 성공적으로 처리되었습니다!")
                    else:
                        st.error("문서를 처리할 수 없습니다.")
        
        # 업로드된 문서 표시
        if st.session_state.uploaded_docs:
            st.subheader("📋 업로드된 문서")
            for doc_name in st.session_state.uploaded_docs:
                st.text(f"• {doc_name}")
    
    # 메인 영역 - 채팅
    if not st.session_state.conversation_chain:
        st.info("📄 사이드바에서 문서를 업로드하고 처리해주세요.")
        return
    
    # 현재 세션이 없으면 새로 생성
    if not st.session_state.current_session_id:
        create_new_session()
    
    current_session = st.session_state.chat_sessions.get(st.session_state.current_session_id)
    if not current_session:
        st.error("세션을 찾을 수 없습니다. 새 세션을 생성해주세요.")
        return
    
    # 채팅 히스토리 표시
    st.subheader(f"💬 {current_session.name}")
    
    # 메시지 표시 영역
    chat_container = st.container()
    
    with chat_container:
        for message in current_session.messages:
            if message["role"] == "user":
                with st.chat_message("user"):
                    st.write(message["content"])
            else:
                with st.chat_message("assistant"):
                    st.write(message["content"])
                    if message.get("sources"):
                        with st.expander("📚 출처"):
                            for i, source in enumerate(message["sources"], 1):
                                st.write(f"{i}. {source}")
    
    # 질문 입력
    user_question = st.chat_input("문서에 대해 질문해보세요...")
    
    if user_question:
        # 사용자 메시지 추가
        current_session.add_message("user", user_question)
        
        # 사용자 메시지 표시
        with st.chat_message("user"):
            st.write(user_question)
        
        # AI 응답 생성
        with st.chat_message("assistant"):
            with st.spinner("답변을 생성하고 있습니다..."):
                try:
                    response = st.session_state.conversation_chain({"question": user_question})
                    answer = response["answer"]
                    source_docs = response.get("source_documents", [])
                    
                    # 답변 표시
                    st.write(answer)
                    
                    # 출처 정보 수집
                    sources = []
                    if source_docs:
                        with st.expander("📚 출처"):
                            for i, doc in enumerate(source_docs, 1):
                                source_name = doc.metadata.get('source', '알 수 없음')
                                page = doc.metadata.get('page', '')
                                page_info = f" (페이지 {page + 1})" if page != '' else ""
                                source_text = f"{source_name}{page_info}"
                                sources.append(source_text)
                                
                                st.write(f"**{i}. {source_text}**")
                                st.write(doc.page_content[:300] + "..." if len(doc.page_content) > 300 else doc.page_content)
                                st.divider()
                    
                    # AI 메시지 추가
                    current_session.add_message("assistant", answer, sources)
                    
                except Exception as e:
                    error_message = f"답변 생성 중 오류가 발생했습니다: {e}"
                    st.error(error_message)
                    current_session.add_message("assistant", error_message)
        
        # 세션 저장
        save_sessions()
        st.rerun()

if __name__ == "__main__":
    main()