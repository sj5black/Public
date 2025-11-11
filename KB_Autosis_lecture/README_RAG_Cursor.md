# 🤖 Cursor AI Agent로 구현하는 RAG 챗봇 실전 강의 (프로젝트명: **RAGLLM**)

## 🧠 1. RAG 개념과 구조 이해
**RAG (Retrieval-Augmented Generation)**  
> 문서(knowledge base)를 검색(Retrieval)한 뒤, LLM이 그 결과를 참고하여 응답을 생성(Generation)하는 구조.

### 🔹 주요 구성요소
- **Document Loader**: 텍스트, PDF, 웹페이지 등 데이터를 로드
- **Text Splitter**: 문서를 일정한 크기로 청킹(chunking)
- **Embedding Model**: 문장을 벡터로 변환
- **Vector Store (FAISS, LanceDB, Chroma)**: 벡터 검색용 데이터베이스
- **Retriever**: 유사도 검색 수행
- **LLM (Ollama / OpenAI)**: 실제 답변 생성

### 🔹 동작 흐름
```
User Query → Retriever (문서 검색) → LLM (문맥 + 답변 생성)
```

---

## 🧰 2. 개발 환경 셋업

### 2.1 필수 도구
- Python 3.10+
- Cursor (VS Code 기반 AI IDE)
- Ollama (로컬 LLM 실행용)
- FastAPI
- LangChain
- FAISS / Chroma

### 2.2 가상환경 구성
```bash
conda create -n ragbot python=3.11 -y
conda activate ragbot
pip install fastapi langchain faiss-cpu openai uvicorn chromadb
```

### 2.3 프로젝트 구조
```
RAGLLM/
 ┣ app/
 ┃ ┣ main.py
 ┃ ┣ rag_pipeline.py
 ┃ ┗ utils/
 ┣ data/
 ┃ ┗ documents/
 ┣ requirements.txt
 ┗ README.md
```

---

## ⚙️ 3. RAG 챗봇 기본 코드 예시

### 3.1 벡터DB 구축 (app/rag_pipeline.py)

```python
# (1) 디렉터리에서 문서를 읽어오는 로더/스플리터/벡터 저장소 관련 유틸 임포트
from langchain.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS

# (2) ./data/documents 폴더에서 .txt 파일만 로드하도록 설정
loader = DirectoryLoader("./data/documents", glob="*.txt")

# (3) 실제 파일 로드 실행 → List[Document] 형태 반환
docs = loader.load()

# (4) 긴 문서를 LLM이 다루기 쉽도록 청킹: 800자 단위, 100자 겹치기
splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)

# (5) 문서 리스트를 청크 단위로 분할
texts = splitter.split_documents(docs)

# (6) OpenAI 임베딩 모델 초기화 (환경변수 OPENAI_API_KEY 필요)
embeddings = OpenAIEmbeddings()

# (7) 분할된 텍스트를 임베딩하여 FAISS 벡터DB 생성
db = FAISS.from_documents(texts, embeddings)

# (8) 로컬 디렉터리에 벡터DB 저장 (추후 로딩용)
db.save_local("vectorstore")
```

#### 📝 각 줄 해설
1. 필요한 LangChain 컴포넌트 임포트.  
2. 특정 폴더를 대상으로 하는 파일 로더 생성(여기선 `.txt`만).  
3. 실제로 파일을 읽어 `Document` 객체 리스트 생성.  
4. RAG의 성능을 좌우하는 청킹 규칙 정의(문맥 보존을 위해 overlap 사용).  
5. 문서를 LLM이 처리하기 좋은 청크 단위로 변환.  
6. 자연어 → 벡터 변환을 위한 임베딩 모델 준비.  
7. 청크 임베딩 후 FAISS 인덱스 생성.  
8. 생성한 인덱스를 디스크에 저장하여 재사용 가능하게 함.  

> ✅ **팁:** OpenAI가 아닌 로컬 임베딩을 쓰고 싶다면 `OpenAIEmbeddings` 대신 `HuggingFaceEmbeddings` 사용 가능

---

### 3.2 질의응답 API (app/main.py)

```python
# (1) FastAPI로 HTTP 서버 구성
from fastapi import FastAPI

# (2) RAG 체인 구성 도우미 체인
from langchain.chains import RetrievalQA

# (3) LLM: OpenAI Chat 모델 (대체로 gpt-4.* 혹은 gpt-4o-mini 사용)
from langchain.chat_models import ChatOpenAI

# (4) 저장했던 FAISS 벡터 저장소 로딩
from langchain.vectorstores import FAISS

# (5) 임베딩 재사용을 위해 동일한 임베딩 클래스 임포트
from langchain.embeddings import OpenAIEmbeddings

# (6) 애플리케이션 인스턴스 생성
app = FastAPI()

# (7) 임베딩 인스턴스 준비 (저장/로딩 시 동일한 임베딩 스펙 사용 권장)
embeddings = OpenAIEmbeddings()

# (8) 디스크에서 로컬 FAISS 인덱스 로드
db = FAISS.load_local("vectorstore", embeddings, allow_dangerous_deserialization=True)

# (9) 검색기(retriever) 생성: 유사 문서 k개를 찾아오도록 설정 가능
retriever = db.as_retriever(search_kwargs={"k": 4})

# (10) LLM 초기화: 모델명과 파라미터 지정
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)

# (11) RetrievalQA 체인 구성: 검색 결과를 LLM에 주입해 답변 생성
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    chain_type="stuff"  # 검색된 문서를 하나로 묶어 프롬프트에 넣는 방식
)

# (12) GET /ask 엔드포인트: 쿼리 파라미터로 질문을 입력
@app.get("/ask")
def ask(query: str):
    # (13) 체인 실행: 내부적으로 retriever → LLM 순서로 호출
    answer = qa_chain.run(query)
    # (14) 질문/답변을 JSON으로 반환
    return {"query": query, "answer": answer}
```

#### 📝 각 줄 해설
1. FastAPI로 HTTP 서버를 띄우기 위한 임포트.  
2. 검색+생성을 묶어 쓰는 고수준 체인 사용.  
3. OpenAI Chat 모델(LangChain 래퍼)을 사용.  
4. 디스크에 저장해둔 FAISS 인덱스를 다시 로딩하기 위한 클래스.  
5. 저장 시 사용한 임베딩과 동일한 스펙으로 로딩하기 위해 임포트.  
6. FastAPI 앱 인스턴스 생성.  
7. 동일한 임베딩 스펙으로 인스턴스화(저장 시점과 로딩 시점이 같아야 검색 품질 유지).  
8. 로컬 디스크에서 FAISS 인덱스를 로딩. `allow_dangerous_deserialization`은 로컬 신뢰 환경에서만 사용 권장.  
9. RAG에서 검색 단계 담당. `k`로 반환 문서 수 조절(기본 4~5 권장).  
10. LLM 초기화: 응답의 창의성/일관성 균형을 위해 `temperature`를 낮게.  
11. 검색 결과를 프롬프트에 포함해 LLM에 전달하는 Retrieval QA 체인 구성.  
12. 간단한 질의엔 GET 방식으로 테스트하기 편해 `/ask` 엔드포인트 정의.  
13. 사용자의 질문을 입력으로 체인을 실행.  
14. 결과를 JSON으로 반환, 프런트/테스트 클라이언트에서 활용 용이.  

---

## 🤝 4. Cursor AI Agent 활용법

### 4.1 AI Agent 기능
- `// AI` 주석으로 프롬프트 실행 가능  
- `Cmd + K` → `Ask Cursor`로 코드 리팩토링  
- “Explain This Code”, “Generate Tests” 기능으로 문맥 기반 리팩토링  
- Agent를 이용해 RAG 파이프라인 자동생성 시연

### 4.2 실습 포인트
1. `rag_pipeline.py` 를 Agent에게 개선 요청  
   - “FAISS 대신 LanceDB로 바꿔줘”  
   - “Ollama 모델(exaone3.5)로 LLM 변경해줘”
2. FastAPI endpoint 자동 생성
3. 에러 디버깅 자동화

---

## 🚀 5. 로컬 실행 & 배포

### 5.1 로컬 테스트
```bash
uvicorn app.main:app --reload --port 8001
```
브라우저에서:  
👉 http://localhost:8001/ask?query=RAG%20구조란?

### 5.2 확장 아이디어
- PDF 업로드 + 즉시 벡터화
- 사용자별 세션 캐시 (SQLite)
- 멀티모달 확장 (이미지 + 텍스트)
- GCP / Render / Docker 배포

---

## 💬 Q&A 및 과제
- Cursor Agent로 FastAPI + Streamlit UI 생성 자동화 실습  
- 과제: “내 회사 문서를 읽는 사내 전용 RAG 챗봇 만들기”  

---

## 📚 참고자료
- [LangChain 공식 문서](https://python.langchain.com/)
- [Cursor AI 공식 페이지](https://www.cursor.sh)
- [Ollama 모델 목록](https://ollama.ai/library)
- [FAISS GitHub](https://github.com/facebookresearch/faiss)
