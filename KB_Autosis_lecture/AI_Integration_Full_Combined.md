# 🤖 AI 도입 방식 비교 및 실전 활용 강의자료 (OpenAI vs Ollama)

## 🎯 강의 목표
AI를 프로젝트에 도입할 때 고려해야 할 두 가지 대표적인 접근법
<br>
- **상용 AI API 기반(OpenAI 등)** 과 **오픈소스 로컬 LLM 기반(Ollama 등)** 의 차이를 이해하고, 각 방식의 구조와 코드 예시를 통해 실무 적용법을 익힌다.

---

## 🩵 1. 기존 LLM모델의 API 활용

### 📌 개요
OpenAI의 ChatGPT API나 Embedding API를 사용하는 방식이다. 
- 클라우드 기반이므로 모델을 직접 설치할 필요가 없다.
- 대신 **API 키 발급**, **과금 구조**, **프롬프트 설계** 등을 이해해야 한다.

---

### 💸 (1) 모델별 토큰 과금 구조

#### OpenAI

| Model                 |  Input | Cached input |      Output | 용도               | 비고                    |
| --------------------- | -----: | -----------: | ----------: | ---------------- | --------------------- |
| **gpt-5-pro**         | $15.00 |            – | **$120.00** | 초대형 코드/에이전트, 연구용 | 최고 성능·초고가, 엔터프라이즈 전용급 |
| **gpt-5**             |  $1.25 |       $0.125 |  **$10.00** | 고난도 추론·코딩·에이전트   | 최신 플래그십 텍스트           |
| **gpt-5-chat-latest** |  $1.25 |       $0.125 |  **$10.00** | 일반 대화·업무 자동화     | gpt-5의 채팅 최적화 트랙      |
| **gpt-5-codex**       |  $1.25 |       $0.125 |  **$10.00** | 코드 생성·리팩토링       | 코드 특화 모델              |
| **gpt-4o**            |  $2.50 |        $1.25 |  **$10.00** | 멀티모달(텍스트+이미지)    | 실시간·비전 가능             |
| **gpt-4.1**           |  $2.00 |        $0.50 |   **$8.00** | 안정적 고성능 일반용      | 4.x 라인 플래그십           |
| **gpt-5-mini**        |  $0.25 |       $0.025 |   **$2.00** | 비용 효율 RAG/요약/자동화 | 빠르고 저렴, 대량 처리 적합      |
| **gpt-4.1-mini**      |  $0.40 |        $0.10 |   **$1.60** | 경량 분석·요약         | 4.1의 경량판              |
| **gpt-4o-mini**       |  $0.15 |       $0.075 |   **$0.60** | 저비용 멀티모달         | 실시간 UI·모바일 친화         |
| **gpt-5-nano**        |  $0.05 |       $0.005 |   **$0.40** | 초저비용 룰기반/보조 태스크  | 지연·품질보다 비용 최우선        |
| **gpt-4.1-nano**      |  $0.10 |       $0.025 |   **$0.40** | 초저비용 경량 처리       | 소형 태스크·프리컴퓨트용         |

#### Gemini
| Model                          | Input (≤0.2M) | Input (>0.2M) |           Output (≤0.2M) | Output (>0.2M) | 용도                | 비고                                                |
| ------------------------------ | ------------: | ------------: | -----------------------: | -------------: | ----------------- | ------------------------------------------------- |
| **Gemini 2.5 Pro**             |         $1.25 |         $2.50 |                  **$10** |        **$15** | 고성능 멀티모달 & 고난도 추론 | 일괄 API 입력 $0.625 / 출력 $5 적용                       |
| **Gemini 2.5 Flash**           |         $0.30 |         $0.30 |                **$2.50** |      **$2.50** | 일반 멀티모달, 속도/비용 균형 | 일괄 API 입력 $0.15 / 출력 $1.25, 학습 토큰 $5/1M           |
| **Gemini 2.5 Flash (Preview)** |         $0.15 |         $0.15 | $0.60 (비추론) / $3.50 (추론) |  $0.60 / $3.50 | 실험용 Flash 프리뷰     | 2025.07.15 종료, 일괄 API 지원 ($0.075 / $0.30 / $1.75) |
| **Gemini 2.5 Flash Live API**  |         $0.50 |         $0.50 |                **$2.00** |      **$2.00** | 실시간 스트리밍·대화       | 오디오 출력 $12, 영상/오디오 입력 $3                          |
| **Gemini 2.5 Flash Lite**      |         $0.10 |         $0.10 |                **$0.40** |      **$0.40** | 초저비용 멀티모달         | 가장 저렴한 Gemini 모델 (일괄 API 없음)                      |

#### Grok
| Model                | 입력 토큰 (1M) | 출력 토큰 (1M) | 비고           |
| -------------------- | ---------: | ---------: | ------------ |
| **Grok-4**           |  **$3.00** | **$15.00** | 현재 주력 모델     |
| **Grok-4-fast**      |  **$0.20** |  **$0.50** | 속도·비용 효율성 중점 |
| **Grok-3**           |  **$3.00** | **$15.00** | 엔터프라이즈 작업 적합 |
| **Grok-code-fast-1** |  **$0.20** |  **$1.50** | 코딩 작업 특화 모델  |

토큰(token): AI 언어 모델이 텍스트를 처리하기 위해 나누는 최소 "의미" 단위   
1. 문장을 작은 조각(Token)으로 분해하고
2. 각 토큰을 고유한 숫자(ID)로 매핑하고
3. 이 ID를 임베딩 벡터로 변환해 신경망에 집어넣는다

한국어
```
한국의 AI 산업 동향을 알려줘

"한", "국", "의", "AI", "산", "업", "동", "향", "을", "알", "려", "줘"
→ 12 tokens
```

영어
```
Summarize the AI industry trends in Korea

["Summ", "arize"], "the", "AI", "industry", "trends", "in", "Korea"
→ 8 tokens
```
→ 통상적으로 같은 표현을 출력할 때 영어가 한국어보다 더 적은 토큰 소모

#### OpenAI 활용 예시

```python
# OpenAI
import os
from dotenv import load_dotenv
from openai import OpenAI

# 1. 환경변수 로드
load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY 가 .env 에 설정되어 있지 않습니다.")

# 2. 클라이언트 생성
client = OpenAI(api_key=api_key)

def ask_ai(query: str) -> str:
    """
    사용자의 질문(query)을 받아 OpenAI gpt-5-nano로 응답을 생성하는 함수
    """
    try:
        response = client.chat.completions.create(
            model="gpt-5-nano",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant specialized in Korean IT and AI industry trends."
                },
                {
                    "role": "user",
                    "content": query
                }
            ]
        )
        # 첫 번째 응답 메시지의 content 추출
        return response.choices[0].message.content
    except Exception as e:
        print(f"[ERROR] OpenAI API 호출 중 오류 발생: {e}")
        return "죄송하지만 지금은 답변을 생성할 수 없습니다. 잠시 후 다시 시도해 주세요."

if __name__ == "__main__":
    # 3. 사용자에게 질문 입력 받기
    user_query = input("질문을 입력하세요 (예: 한국의 AI 산업 동향 요약): ")

    # 4. AI에게 질문 전달 후 응답 받기
    answer = ask_ai(user_query)

    # 5. 응답 출력
    print("\n[AI 응답]")
    print(answer)
```

---

### 🧠 (2) 프롬프트 엔지니어링

#### 🧩 개념
LLM은 명확하고 구조화된 명령에 가장 잘 반응한다. 프롬프트는 모델의 **지시문(Instruction)** 역할을 한다.

#### 🔹 기본 예시
```python
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
  model="gpt-5-nano",
  messages=[
    {"role": "system", "content": "You are a helpful assistant for research."},
    {"role": "user", "content": "Summarize Tesla’s Q3 earnings highlights."}
  ]
)
print(response.choices[0].message.content)
```

#### 🔹 고급 프롬프트 구조 (4단계 구조)
```
[ROLE] → 모델 역할 정의
[CONTEXT] → 참고할 배경 정보
[TASK] → 수행할 구체적 목표
[OUTPUT FORMAT] → 출력 형식 명시

예시:
ROLE: You are a financial analyst.
CONTEXT: Tesla’s Q3 2024 report
TASK: Summarize key metrics (Revenue, EPS, Guidance)
OUTPUT FORMAT: Markdown table
```

#### One‑shot
```python
demo = (
  "입력: 리뷰 — '배터리가 오래가고 화면이 선명하다'\n"
  "출력: 긍정 | 이유: 배터리 수명, 화면 품질"
)
messages=[
  {"role":"system","content":"You are a sentiment tagger. '긍정/부정'과 '이유'만 출력."},
  {"role":"user","content": demo},
  {"role":"user","content":"입력: 리뷰 — '발열이 심하고 가격이 비싸다'"}
]
print(client.chat.completions.create(model="gpt-5-mini", messages=messages)
      .choices[0].message.content)
```

#### Few‑shot
```python
shots=[("품질이 끔찍하고 환불했다","부정"),
       ("배송이 빨랐고 포장이 완벽했다","긍정")]
msgs=[{"role":"system","content":"문장을 긍정/중립/부정으로 분류"}]
for x,y in shots:
    msgs+=[{"role":"user","content":x},{"role":"assistant","content":y}]
msgs.append({"role":"user","content":"가격은 높지만 만족스럽다"})
print(client.chat.completions.create(model="gpt-5-mini", messages=msgs)
      .choices[0].message.content)
```

#### JSON/스키마 제약
```python
schema = {
  "type":"object",
  "properties":{
    "label":{"type":"string","enum":["pos","neg","neu"]},
    "evidence":{"type":"array","items":{"type":"string"}}
  },
  "required":["label"]
}
client.chat.completions.create(
  model="gpt-5-mini",
  messages=[{"role":"user","content":"문장: '배송 빠르고 포장 불량' 감성 라벨링"}],
  response_format={"type":"json_schema","json_schema":schema}
)
```
---

### ⚙️ (3) 주요 파라미터 설명

| 파라미터 | 설명 | 권장 범위 | 특징 |
|-----------|------|-----------|------|
| `temperature` | 창의성 제어 | 0.2~0.8 | 낮을수록 일관성↑ |
| `top_p` | 누적 확률 컷 | 0.7~0.95 | 다양성 제어 |
| `top_k` | 상위 후보 개수 컷 | 10~50 | 랜덤성 제어 |
| `max_tokens` | 출력 최대 길이 | 모델별 상한 | 문장 길이 제한 |
| `presence_penalty` | 새로운 주제 유도 | 0~2 | 반복 방지 |
| `frequency_penalty` | 단어 반복 억제 | 0~2 | 다양성 확보 |

> ✅ RAG 챗봇에는 일반적으로 `temperature=0.3`, `top_p=0.85`, `top_k=20`이 안정적이다.

---

## 🧡 2. 오픈소스 기반 LLM (Ollama)

### 📌 개요
- 모델을 **로컬 환경(GPU/CPU)** 에 직접 다운로드하여 실행.
- 완전한 오프라인 환경에서도 작동 가능.
- **비용 없음**, 하지만 GPU 성능과 메모리 관리 필요.

---

### ⚖️ (1) 주요 모델 비교

| 모델 | 파라미터 수 | 특징 | 권장 용도 |
|------|--------------|------|------------|
| **llama3:8b / 70b** | 8B~70B | Meta 개발, 영어 성능 우수 | 일반 QA, 코딩 |
| **mistral:7b** | 7B | 속도 빠르고 효율적 | 대화형 챗봇 |
| **phi3:3.8b** | 3.8B | 경량, CPU 구동 가능 | 저사양 장비 |
| **exaone3.5** | – | 한국어 최적화 | 한글 RAG, 로컬 서비스 |
| **gemma2:9b** | 9B | Google 모델, 일관성 우수 | 문서 요약 |

#### 💡 파라미터(Parameters)란?
- LLM에서의 각 뉴런 간 연결되는 가중치(weight) 정도
- float값으로 표현되며, 문장을 해석할 때 해당 수치들을 조합해 "다음 단어(토큰)의 확률"을 계산
- 파라미터가 많을수록 더 많고 세밀한 언어적 패턴 구사가 가능하지만, vRAM 메모리 사용량도 높아짐

### 🆕 (2) GPU/CUDA 활용

오픈소스 LLM을 실제 서비스 환경에서 구동하면 가장 먼저 부딪히는 문제는 **속도와 자원(특히 VRAM)** 이다.  
대부분의 LLM 연산은 **Self-Attention**과 **대규모 행렬 곱(MatMul)** 로 이루어져 있으며, 이는 동일한 연산을 수천 번 반복 수행하는 형태다.  
이때 GPU의 **병렬 연산 구조(CUDA)** 가 빛을 발한다. GPU는 수천~수만 개의 코어로 동시에 연산을 수행할 수 있고, 고속 GDDR/HBM 메모리를 통해 CPU 대비 훨씬 넓은 대역폭을 제공한다.
따라서 LLM 추론 시 GPU를 활용하면 **지연(latency)이 급감**하고, 동시에 **처리량(throughput)** 도 극적으로 증가한다.

또한 GPU는 **혼합정밀도(FP16/BF16)**, **텐서 코어(Tensor Core)**, **양자화(Quantization, gguf 4bit/6bit)** 등을 통해 메모리 사용량을 줄이면서도 연산 효율을 높인다. Ollama는 이러한 최적화를 자동으로 적용해 GPU가 존재하면 CUDA로 전환하고, 없으면 자동으로 CPU fallback을 수행한다.  
결과적으로, **같은 하드웨어에서도 속도를 높이고 VRAM 효율을 극대화할 수 있는 구조**가 된다.

**혼합정밀도**: 기존 FP32로만 구현된 저장방식을 정보중요도에 따라 FP32랑 FP16/BF16을 섞어서   
→ VRAM 덜 쓰고, 수치 안정성 유지하면서 빠르게 계산하는 테크닉  
→ 모델 파라미터 / activation: FP16 또는 BF16   
→ Gradient accumulation, 일부 optimizer 내부 계산, loss: FP32 유지   
→ FP = Floating Point (ex: 3.141592, 2367.235, 106903.1)   
→ BF = Brain Floating Point (bfloat16)

**텐서 코어**: FP16/BF16 행렬 곱 연산에 특화된 딥러닝 전용 하드웨어 유닛   
→ 일반 CUDA 코어로 FP32 행렬연산 시 클록 당 처리하는 연산개수가 제한적인데, 텐서코어는 작은 행렬블록을 한번에 처리하여 훨씬 빠름

**양자화**: 학습된 모델 가중치를 극단적으로 압축해서 모델 크기·VRAM을 확 줄이면서도, 성능은 어느 정도 유지하는 테크닉   
→ 기존 32비트 체계의 실수정보를 8bit, 6bit, 4bit 단위로 축소 (메모리 절감)   
→ 중요도가 높은 weight만 정밀도를 유지하고, 그 외의 정보만 압축하기 떄문에 메모리 효율 대비 성능이 크게 변하지 않음

---

### ⚙️ (3) 임베딩 ↔ 생성(LLM) 분리

RAG 파이프라인에서 **임베딩(Encoder)** 과 **생성(Decoder)** 은 성격이 완전히 다르다.

- **임베딩(Embedding)** 은 입력 텍스트를 벡터로 바꾸는 **단발성 연산**이 많아 CPU에 적합하다.  
- **생성(Generation)** 은 토큰을 반복적으로 생성하는 과정이므로, GPU 병렬화 효과가 크다.

따라서 보통은 **임베딩=CPU / 생성=GPU** 로 분리한다.  
이렇게 하면 GPU 리소스를 생성에 집중시켜 **VRAM을 절약**하고, CPU는 배치 임베딩이나 색인 검색 등 I/O 중심 작업을 처리한다.  
또한 임베딩을 클라우드 API(OpenAI Embeddings 등)로 넘기고, 생성만 로컬 GPU에서 돌리는 **하이브리드 구조**도 흔하다.


#### 💡 예시: CPU 임베딩 + GPU LLM 추론

```python
from sentence_transformers import SentenceTransformer
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# 1️⃣ CPU로 임베딩 (문서 벡터화)
embed_model = SentenceTransformer("intfloat/multilingual-e5-base", device="cpu")
vec = embed_model.encode(["스마트 물류 혁신 전략"], normalize_embeddings=True)

# 2️⃣ GPU로 LLM 추론 (FP16으로 VRAM 절약)
device = "cuda" if torch.cuda.is_available() else "cpu"
tok = AutoTokenizer.from_pretrained("meta-llama/Llama-3-8B-Instruct")
llm = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3-8B-Instruct",
    torch_dtype=torch.float16,
    device_map={"": device}
)
inputs = tok("요약: 스마트 물류 혁신 전략의 핵심 3줄.", return_tensors="pt").to(device)
print(tok.decode(llm.generate(**inputs, max_new_tokens=160)[0], skip_special_tokens=True))
```


### ⚙️ (4) 다중 인스턴스 - 로드 밸런싱

####  Ollama에서 다중 인스턴스(Multi-Instance)가 필요한 이유

####  1. LLM은 “싱글 스레드 추론(single-thread inference)” 구조
대부분의 LLM은 내부적으로 **토큰을 한 번에 하나씩 생성**하는 구조다.  
즉, 한 요청이 들어오면 모델이 **순차적으로 토큰을 생성해야 하며**,  
이 과정 동안에는 해당 GPU 자원이 **그 요청에만 점유(lock)** 된다.

> 🔸 예시  
> - `generate()` 함수는 한 문장을 다 생성할 때까지 GPU를 독점함  
> - 다른 사용자가 동시에 요청을 보내면 **대기(queue)** 상태로 밀려남  

따라서 단일 인스턴스(Ollama 서버 1개)로는 **동시 요청 처리(Concurrency)** 가 불가능하거나  
**심각한 지연(latency spike)** 이 발생하게 된다.

---

#### 2. 다중 인스턴스로 “병렬 처리(Pipelining)” 가능
여러 Ollama 인스턴스를 띄우면(예: 포트 11434, 11435, 11436),  
각 인스턴스가 **서로 독립적인 LLM 프로세스**로 작동한다.  
즉, 한 인스턴스가 A 사용자의 질문을 처리하는 동안  
다른 인스턴스가 B, C, D 요청을 동시에 수행할 수 있다.

이 구조는 **파이프라인 처리(pipelined parallelism)** 에 가깝고,  
실질적으로 **API 서버의 동시처리량(QPS)** 을 3배 이상 향상시킨다.

> 💡 즉, “한 모델 여러 명이 동시에 쓴다”는 구조가 아니라  
> “모델 프로세스를 여러 개 띄워서 분담시킨다”는 개념이다.

---

#### 3. GPU 활용 효율 극대화
LLM은 GPU 메모리를 많이 차지하지만 항상 모든 GPU 코어를 100% 쓰는 것은 아니다.  
모델 크기나 프롬프트 길이에 따라 **GPU 유휴 시간(idle time)** 이 발생한다.  
이때 여러 인스턴스를 병렬로 운영하면 GPU 자원을 보다 **균등하게 활용(load balancing)** 할 수 있다.

예:
- 1개의 Llama-3-8B 인스턴스 → GPU 사용률 45~60%  
- 3개의 Llama-3-8B 인스턴스 → 평균 사용률 85~95%  
→ 같은 GPU에서 더 많은 요청을 빠르게 처리 가능

---

#### 4. 부하 분산(Load Balancing) 및 장애 대응
다중 인스턴스 환경에서는 애플리케이션 레벨에서  
`round-robin`, `asyncio.gather`, `FastAPI BackgroundTask` 등을 이용해  
각 요청을 **랜덤 또는 순차 분배**할 수 있다.

#### 1. 한개의 서버 PC에서 여러개의 ollama 인스턴스(예 : 3개의 포트)를 분리하여 분산처리.

```python
# =========================================
# ✅ Ollama 여러 포트로 분산 요청 예시
# =========================================
import requests
import itertools
import concurrent.futures

# 한 PC 내 서로 다른 포트에서 실행 중인 Ollama 인스턴스
OLLAMA_INSTANCES = [
    "http://127.0.0.1:11434",
    "http://127.0.0.1:11435",
    "http://127.0.0.1:11436"
]

# 라운드로빈 제너레이터
round_robin = itertools.cycle(OLLAMA_INSTANCES)

def ask_local_ollama(prompt: str, model="exaone3.5"):
    server = next(round_robin)
    payload = {
        "model": model,
        "prompt": prompt,
        "options": {"temperature": 0.3, "top_p": 0.9}
    }
    res = requests.post(f"{server}/api/generate", json=payload, timeout=120)
    res.raise_for_status()
    answer = res.json().get("response")
    print(f"[{server}] 응답 완료")
    return server, answer

# 테스트 프롬프트들
prompts = [
    "한국의 AI 산업 현황을 요약해줘.",
    "인공지능 스타트업의 주요 투자 트렌드는?",
    "정부의 AI 정책 방향을 간단히 설명해줘."
]

# 동시에 3개 요청 보내기 (ThreadPoolExecutor 활용)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    futures = [executor.submit(ask_local_ollama, p) for p in prompts]
    for future in concurrent.futures.as_completed(futures):
        server, result = future.result()
        print(f"\n🖥️ {server} 응답: {result}\n")
```

<br>

#### 2. 여러개의 서버PC(예: 3대 GPU 머신)를 활용해 자동 분산처리.

```python
import requests, random

OLLAMA_SERVERS = [
  "http://192.168.0.11:11434",
  "http://192.168.0.12:11434",
  "http://192.168.0.13:11434",
]

def ask_ollama(prompt: str):
    server = random.choice(OLLAMA_SERVERS)
    res = requests.post(f"{server}/api/generate", json={
        "model": "mistral:7b",
        "prompt": prompt,
        "options": {"temperature": 0.3}
    })
    return res.json()["response"]

print(ask_ollama("한국 AI 시장의 투자 트렌드를 요약해줘."))
```


---

## 💻 3. AI 활용방식 비교

#### 🔹 OpenAI 방식
```python
# =========================================
# ✅ OpenAI GPT-4o-mini 실전 예시
# =========================================

from openai import OpenAI
import os
from dotenv import load_dotenv

# 1️⃣ .env 파일에서 API 키 불러오기 (.env 내용: OPENAI_API_KEY="sk-xxxxx")
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

# 2️⃣ 클라이언트 생성
client = OpenAI(api_key=api_key)

# 3️⃣ 대화 요청
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a helpful AI assistant that writes in Korean."},
        {"role": "user", "content": "한국의 AI 산업 동향을 핵심만 요약해줘."}
    ],
    temperature=0.3,
    top_p=0.9
)

# 4️⃣ 결과 출력
print(response.choices[0].message.content)
```

1. OpenAI 서버에서 GPU 연산이 이미 수행되므로,
사용자 로컬에 GPU가 없어도 가능.
2. 단, 토큰 단가가 있으므로 각 API 요청(질문/답변) 마다 요금이 누적되는 방식


#### 🔹 Ollama 방식
```python
import requests

payload = {
  "model": "exaone3.5",
  "messages": [{"role": "user", "content": "한국의 AI 산업 동향 요약"}],
  "options": {"temperature": 0.3, "top_p": 0.9}
}

res = requests.post("http://localhost:11434/api/chat", json=payload)
print(res.json()["message"]["content"])
```
1. 오픈소스 기반 LLM을 직접 PC에 다운로드하여 사용. (외부서버 연결 없이 구동가능)
2. LLM이 PC에서 직접 구동되기 때문에 고성능 GPU 필요 (CUDA toolkit)
<br><br>

| 구분 | OpenAI (Cloud 기반) | Ollama (Opensource 기반)|
|------|---------|---------|
| **API Key 필요** | ✅ | ❌ |
| **실행 위치** | 클라우드 | 로컬 |
| **응답 속도** | 빠름 (서버 최적화) | GPU 의존 |
| **성능** | 서버 최적화, 최신 모델 | 환경 의존적 |
| **비용** | 토큰 과금 | 무료 (GPU 비용만) |
| **유지보수** | 최소 | 모델 관리 필요 |
| **보안성** | 외부 전송 필요 | 내부 전용 가능(On-Premise) |
| **확장성** | 무한 | 서버 증설 필요 |
| **데이터 제어** | 불가 | 완전 자유 |
| **적합 사례** | SaaS, 글로벌 서비스 | 사내 챗봇, 폐쇄망 |

---

## 🧩 4. 통합형 RAG 예시 (Hybrid 구성)

> OpenAI + Ollama 를 혼용하여, 품질과 비용의 균형을 맞추는 방법법

```python
"""
Hybrid RAG (OpenAI + Ollama)
- OpenAI: 최종 응답 생성(고품질)
- Ollama: 질의 확장(Multi-Query), 문서 압축/추출(LLM 기반 리러킹 대용)
- Dense(FAISS) + Sparse(BM25) 앙상블 → LLM 압축 → RetrievalQA

요구사항:
- pip install -U "langchain>=0.2" langchain-community langchain-openai langchain-huggingface faiss-cpu
- pip install -U sentence-transformers
- (선택) pip install -U pydantic-settings python-dotenv
- Ollama 서버 동작 필요(예: ollama run exaone3.5 or llama3.2:latest)
- 환경변수: OPENAI_API_KEY

테스트 문서 폴더: ./docs
- .txt, .md, .pdf(텍스트만), .csv 등 간단 예시 문서 배치
"""
from __future__ import annotations
import os
import sys
from typing import List

# LangChain Core
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.retrievers import EnsembleRetriever
from langchain.schema.runnable import RunnablePassthrough

# Loaders
from langchain_community.document_loaders import DirectoryLoader, TextLoader, CSVLoader, PyPDFLoader

# Vectorstores & Retrievers
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.retrievers import BM25Retriever

# LLMs
from langchain_community.llms import Ollama

# Compression / Reranking (LLM-based)
from langchain.retrievers.document_compressors import LLMChainExtractor
from langchain.retrievers import ContextualCompressionRetriever

# Multi-Query Retriever
from langchain.retrievers.multi_query import MultiQueryRetriever

# Chains
from langchain.chains import RetrievalQA
from langchain.prompts import ChatPromptTemplate


# -----------------------------
# 0. 환경 체크
# -----------------------------
def check_env():
    if not os.getenv("OPENAI_API_KEY"):
        print("[WARN] OPENAI_API_KEY가 설정되지 않았습니다. export/setx 로 설정하세요.")


# -----------------------------
# 1. 문서 로드 & 청크 분할
# -----------------------------
def load_documents(doc_dir: str = "./docs") -> List[Document]:
    loaders = []
    if not os.path.isdir(doc_dir):
        os.makedirs(doc_dir, exist_ok=True)
        print(f"[INFO] 문서 폴더가 없어 생성했습니다: {doc_dir}")

    # DirectoryLoader: 텍스트/마크다운 우선
    loaders.append(DirectoryLoader(doc_dir, glob="**/*.txt", loader_cls=TextLoader, show_progress=True))
    loaders.append(DirectoryLoader(doc_dir, glob="**/*.md", loader_cls=TextLoader, show_progress=True))

    # PDF (간단 텍스트 추출)
    try:
        loaders.append(DirectoryLoader(doc_dir, glob="**/*.pdf", loader_cls=PyPDFLoader, show_progress=True))
    except Exception:
        print("[WARN] PyPDFLoader 사용 불가. pdf 텍스트 추출을 건너뜁니다.")

    # CSV (옵션)
    try:
        loaders.append(DirectoryLoader(doc_dir, glob="**/*.csv", loader_cls=CSVLoader, show_progress=True))
    except Exception:
        pass

    docs: List[Document] = []
    for l in loaders:
        try:
            docs.extend(l.load())
        except Exception as e:
            print(f"[WARN] 일부 로더 실패: {type(l).__name__}: {e}")

    if not docs:
        print("[WARN] ./docs 가 비어있습니다. 예시 파일을 넣어주세요.")

    # 스플리터 (문맥 보존)
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=900,
        chunk_overlap=120,
        separators=["\n## ", "\n# ", "\n\n", "\n", " "]
    )
    chunks = splitter.split_documents(docs)
    print(f"[INFO] 로드된 문서: {len(docs)}개 → 청크: {len(chunks)}개")
    return chunks


# -----------------------------
# 2. 임베딩 & 벡터스토어 (Dense)
# -----------------------------
def build_dense_retriever(chunks: List[Document], use_openai_embeddings: bool = True):
    if use_openai_embeddings:
        embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
    else:
        # 로컬 무료 임베딩(e5) — 속도는 느리지만 비용 0
        embeddings = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-base")

    vs = FAISS.from_documents(chunks, embeddings)
    dense_retriever = vs.as_retriever(search_type="mmr", search_kwargs={"k": 8, "fetch_k": 24, "lambda_mult": 0.3})
    return dense_retriever


# -----------------------------
# 3. Sparse(BM25) + Dense 앙상블
# -----------------------------
def build_ensemble_retriever(chunks: List[Document]):
    # BM25 (키워드 기반)
    bm25 = BM25Retriever.from_documents(chunks)
    bm25.k = 8

    # Dense (OpenAI or HF)
    dense = build_dense_retriever(chunks, use_openai_embeddings=True)

    # 앙상블: RRF/가중 합성 유사 — LangChain 제공 EnsembleRetriever
    ensemble = EnsembleRetriever(retrievers=[bm25, dense], weights=[0.45, 0.55])
    return ensemble


# -----------------------------
# 4. Multi-Query with Ollama (질의 확장)
# -----------------------------
def build_multiquery_retriever(base_retriever, ollama_model: str = "exaone3.5"):
    mq_llm = Ollama(model=ollama_model, temperature=0.2)
    mqr = MultiQueryRetriever.from_llm(retriever=base_retriever, llm=mq_llm,
                                       prompt=ChatPromptTemplate.from_template(
                                           """
                                           사용자의 질문을 더 잘 검색하기 위해, 서로 다른 관점의 한국어 하위 질의 4개를 간결히 생성하라.
                                           - 의미적으로 다양한 표현 사용
                                           - 동의어·관련개념 포함
                                           - 각 질의는 한 줄
                                           질문: {question}
                                           """
                                       ))
    return mqr


# -----------------------------
# 5. LLM 기반 압축 리트리버 (Ollama)
# -----------------------------
def build_compression_retriever(base_retriever, ollama_model: str = "exaone3.5"):
    ollama_llm = Ollama(model=ollama_model, temperature=0.0)
    compressor = LLMChainExtractor.from_llm(ollama_llm)
    compression_retriever = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=base_retriever,
    )
    return compression_retriever


# -----------------------------
# 6. 최종 QA 체인 (OpenAI 생성)
# -----------------------------
def build_qa_chain(retriever):
    openai_llm = ChatOpenAI(model="gpt-5-mini", temperature=0.2)

    system_prompt = (
        "당신은 주어진 문서들만 활용하여 정확하고 간결한 한국어 답변을 작성하는 어시스턴트입니다. "
        "추측은 금지하고, 출처 근거를 요약해서 답변 끝에 bullet로 나열하세요."
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "질문: {question}\n\n" \
                   "다음은 검색으로 회수된 문서의 핵심 발췌입니다:\n{context}\n\n" \
                   "위 정보만을 바탕으로 답변하세요. 불확실하면 모른다고 말하세요."),
    ])

    chain = RetrievalQA.from_chain_type(
        llm=openai_llm,
        retriever=retriever,
        chain_type="stuff",
        chain_type_kwargs={"prompt": prompt},
        return_source_documents=True,
    )
    return chain


# -----------------------------
# 7. 하이브리드 파이프라인 구성 헬퍼
# -----------------------------
def build_hybrid_pipeline(docs_dir: str = "./docs",
                          ollama_model: str = "exaone3.5"):
    chunks = load_documents(docs_dir)

    # 1) Dense+BM25 앙상블
    ensemble = build_ensemble_retriever(chunks)

    # 2) Multi-Query로 질의 다양화 (Ollama)
    mqr = build_multiquery_retriever(ensemble, ollama_model)

    # 3) LLM 압축 리트리버 (Ollama)
    compressed = build_compression_retriever(mqr, ollama_model)

    # 4) 최종 QA 체인 (OpenAI)
    qa_chain = build_qa_chain(compressed)
    return qa_chain


# -----------------------------
# 8. 실행 예시
# -----------------------------
def demo():
    check_env()
    qa = build_hybrid_pipeline(docs_dir="./docs", ollama_model="exaone3.5")

    queries = [
        "스마트그린산단 RAG 파이프라인의 장점과 단점은?",
        "물류 데이터에서 세션 기반 볼륨 클러스터가 의미하는 바는?",
        "이 프로젝트의 배포 구조(클라우드/온프렘)를 요약해줘",
    ]

    for q in queries:
        print("\n==============================")
        print("[QUERY]", q)
        result = qa({"query": q})
        print("[ANSWER]\n", result["result"])  # 최종 답변
        print("[SOURCES]")
        for i, d in enumerate(result.get("source_documents", [])[:5], 1):
            m = d.metadata or {}
            print(f"  {i}. {m.get('source', 'unknown')}  (p:{m.get('page', '-')})")


# -----------------------------
# 9. 고급: 리스크/성능 팁
# -----------------------------
"""
- 비용최적화: 임베딩은 HF(e5)로 구축, 응답만 OpenAI. 반대로 품질 필요시 임베딩도 OpenAI.
- 속도최적화: search_kwargs의 k/fetch_k 조정, chunk_size 줄이기, BM25 가중치 강화.
- 품질: Multi-Query 개수 3→6, Compressor 템플릿을 Q/A 특화로 커스터마이즈.
- 캐싱: FAISS 인덱스를 로컬에 저장/로드(vs.save_local/load_local).
- 스트리밍: ChatOpenAI(streaming=True) + 콜백 핸들러 사용.
- 에러핸들링: Ollama 서버 미동작 시 예외 처리(대체 경로: MQR 생략 + Ensemble만).
"""


if __name__ == "__main__":
    try:
        demo()
    except KeyboardInterrupt:
        print("\n[INFO] Interrupted by user.")
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)
```

---

### 💻 (2) API 활용 방식 비교

