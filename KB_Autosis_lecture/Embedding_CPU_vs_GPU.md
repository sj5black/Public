# 🧠 임베딩(Embedding)은 CPU, LLM은 GPU에서 구동하는 이유

## 1️⃣ 임베딩 vs LLM 구동 원리

| 구분 | 임베딩(Embedding Model) | LLM(Language Model) |
|------|------------------------|---------------------|
| **입력/출력** | 문장 → 벡터 | 문장 → 다음 단어 확률 |
| **주요 연산** | 피처 추출 (벡터 생성) | 시퀀스 생성 (디코딩 반복) |
| **연산 형태** | 1회 forward pass | 토큰 단위 반복 추론 |
| **자원 요구도** | CPU로 충분 | GPU 필요 |
| **병렬성 요구도** | 낮음 | 매우 높음 |

---

## 2️⃣ 내부 구조

### 🔹 임베딩 (Encoder 기반)
```
문장 입력 → 토큰화 → [Encoder Layers] → 평균풀링 → 벡터 출력
```

### 🔹 LLM (Decoder 기반)
```
입력 문장 → Self-Attention 반복 → 다음 단어 예측 → 반복 디코딩
```

---

## 3️⃣ CPU vs GPU 연산 방식

| 구분 | CPU | GPU |
|------|------|------|
| **코어 개수** | 수십 개 | 수천~수만 개 |
| **특화 영역** | 순차 연산, 제어 로직 | 병렬 벡터/행렬 연산 |
| **적합 작업** | 임베딩, 인덱싱 | LLM 추론, Attention |
| **메모리 구조** | 캐시 중심 | GDDR/HBM 고대역폭 |
| **대표 작업 예시** | 텍스트 벡터화 | 70B 파라미터 추론 |

---

## 4️⃣ 실제 코드 비교

### ✅ CPU 임베딩
```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("intfloat/multilingual-e5-base", device="cpu")
embeddings = model.encode(["AI is changing the world."])
print(embeddings.shape)
```

### ✅ GPU LLM 추론
```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

tok = AutoTokenizer.from_pretrained("meta-llama/Llama-3-8B-Instruct")
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3-8B-Instruct",
    torch_dtype=torch.float16,
    device_map="auto"
)
inputs = tok("Explain CPU vs GPU.", return_tensors="pt").to("cuda")
print(tok.decode(model.generate(**inputs, max_new_tokens=50)[0], skip_special_tokens=True))
```

---

## 5️⃣ 임베딩과 LLM 분리 실행 이유

| 이유 | 설명 |
|------|------|
| **VRAM 절약** | 임베딩은 CPU에서, 생성은 GPU에서 분리 |
| **속도 효율** | LLM 생성 단계만 GPU 병렬 처리 |
| **자원 분산** | CPU 서버는 벡터화, GPU 서버는 생성 담당 |
| **RAG 아키텍처 적합** | 검색(Retriever)은 CPU, 생성(Generator)은 GPU |

---

## 6️⃣ 전체 구조 요약

```
사용자 질문
   ↓
[CPU] 임베딩 → 벡터 검색
   ↓
[GPU] LLM → 답변 생성
   ↓
응답 출력
```

---

## 🧭 요약 도표

| 구분 | CPU (Embedding/검색) | GPU (LLM 생성) |
|------|----------------------|----------------|
| **역할** | 문서 벡터화, 인덱싱 | 답변 생성 |
| **필요성** | 단순 Forward Pass | 반복적 Attention |
| **효율성** | 저비용 | 고속 병렬 연산 |
| **RAG에서의 위치** | Retriever | Generator |
