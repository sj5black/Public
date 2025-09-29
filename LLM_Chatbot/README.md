# 📚 RAG 문서 챗봇

GPT-5와 RAG(Retrieval Augmented Generation)를 활용한 문서 기반 챗봇입니다.

## ✨ 주요 기능

- 📄 **다중 문서 지원**: PDF, TXT 파일 업로드 및 처리
- 🤖 **GPT-5 기반 대화**: 최신 GPT-5 모델을 활용한 정확한 답변
- 📚 **출처 표기**: 답변에 대한 정확한 출처 문서 및 페이지 정보 제공
- 💬 **세션 관리**: 여러 대화 세션 생성, 저장, 불러오기
- 🔍 **유사도 검색**: 벡터 기반 문서 검색으로 관련성 높은 정보 제공

## 🚀 설치 및 실행

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 애플리케이션 실행

```bash
streamlit run app.py
```

### 3. OpenAI API 키 설정

- 웹 인터페이스의 사이드바에서 OpenAI API 키 입력
- GPT-5 모델 사용을 위해 유효한 API 키 필요

## 📖 사용 방법

### 1. 문서 업로드
1. 사이드바의 "📄 문서 업로드" 섹션에서 PDF/TXT 파일 업로드
2. "📚 문서 처리하기" 버튼 클릭
3. 문서가 성공적으로 처리되면 벡터 데이터베이스 생성 완료

### 2. 채팅 시작
1. 메인 화면 하단의 채팅 입력창에 질문 입력
2. 업로드한 문서 내용을 기반으로 GPT-5가 답변 생성
3. 답변과 함께 출처 정보 자동 표시

### 3. 세션 관리
- **새 세션 생성**: "🆕 새 세션 생성" 버튼으로 새로운 대화 세션 시작
- **세션 전환**: 사이드바에서 기존 세션 선택하여 이전 대화 이어가기
- **세션 삭제**: 각 세션 옆 "🗑️" 버튼으로 세션 삭제
- **세션 이름 변경**: "✏️ 세션 이름 변경" 버튼으로 세션명 수정

## 🔧 기술 스택

- **Frontend**: Streamlit
- **LLM**: OpenAI GPT-5
- **RAG Framework**: LangChain
- **Vector Store**: FAISS
- **Embeddings**: OpenAI text-embedding-3-small
- **Document Processing**: PyPDF2, LangChain Document Loaders

## 📁 파일 구조

```
├── app.py                 # 메인 애플리케이션 파일
├── requirements.txt       # Python 의존성 목록
├── chat_sessions.json     # 채팅 세션 저장 파일 (자동 생성)
└── README.md             # 사용 가이드
```

## ⚙️ 주요 설정

### 텍스트 분할 설정
- **Chunk Size**: 1000 문자
- **Chunk Overlap**: 200 문자
- **분할 방식**: RecursiveCharacterTextSplitter

### 검색 설정
- **검색 결과 수**: 3개 문서
- **유사도 검색**: FAISS 벡터 스토어 기반

### GPT-5 모델 설정
- **Temperature**: 0.7
- **모델**: gpt-5
- **메모리**: ConversationBufferMemory

## 🎯 사용 예시

1. **법률 문서 분석**
   - 계약서, 법령 등 PDF 업로드
   - "이 계약의 해지 조건은 무엇인가요?" 질문

2. **기술 문서 검색**
   - API 문서, 매뉴얼 등 업로드
   - "인증 방법에 대해 설명해주세요" 질문

3. **학술 논문 요약**
   - 연구 논문 PDF 업로드
   - "이 논문의 주요 결론은 무엇인가요?" 질문

## 🔒 보안 및 프라이버시

- API 키는 세션 중에만 메모리에 저장
- 업로드된 문서는 임시 파일로 처리 후 자동 삭제
- 채팅 세션은 로컬 JSON 파일에 저장

## ⚠️ 주의사항

- GPT-5 모델 사용 시 OpenAI API 사용료 발생
- 대용량 문서 처리 시 시간이 소요될 수 있음
- 인터넷 연결 필요 (OpenAI API 호출)

## 🔧 트러블슈팅

### API 키 오류
```
Error: OpenAI API key not found
```
→ 사이드바에서 유효한 OpenAI API 키 입력 확인

### 문서 처리 오류
```
Error: Cannot process document
```
→ PDF 파일이 손상되지 않았는지 확인
→ 한글 인코딩 문제 시 UTF-8로 저장된 TXT 파일 사용

### 메모리 부족 오류
→ 큰 문서 파일을 작은 단위로 분할하여 업로드

## 🆕 업데이트 계획

- [ ] 더 많은 문서 형식 지원 (DOCX, PPTX)
- [ ] 고급 검색 필터링 옵션
- [ ] 대화 내용 내보내기 기능
- [ ] 다국어 지원
- [ ] 클라우드 저장소 연동