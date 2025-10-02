# 📘 RAG 챗봇 강의 이론

<br><br>

## 목차
1. 프로젝트 관련 이론 강의
2. Git / Github 환경 구축 (레포지토리 생성 및 간단한 커밋 실습)
3. Miniconda 활용 (가상환경 생성)
4. 프로젝트 기본 트리 구성
    - README.md
    - requirements.txt
    - .gitignore
    - .env
5. 파이썬 기초문법 강의/실습

<br><br>

# 바이브 코딩을 하기 위해 프로그래밍 언어를 알아야 하는 이유

바이브 코딩(Vibe Coding)이란?

**AI와 대화하듯이 코드를 작성하고 실행하면서 학습하거나 프로젝트를 진행하는 방식**

<br>

## 1. AI의 답변을 이해하고 활용
- AI가 제안하는 코드가 어떤 의미를 가지는지 이해하려면 **기본적인 프로그래밍 언어 지식**이 필요
- 언어를 아예 모르면 개발이 지속될수록 코드가 복잡해지고 실제 사용되지 않는 더미코드들이 점점 쌓여감.

---

## 2. 오류 해결(디버깅)
- AI가 생성한 코드가 항상 완벽하지는 않음
- 에러 수정을 요청할때에도, 기본적인 코드 동작 원리를 이해하고 있어야 어느 부분을 어떻게 수정할지 좀 더 구체적인 지시를 내릴 수 있음

---

## 3. 원하는 기능을 정확히 전달
- AI에게 지시를 내릴 때도 **프로그래밍 언어 개념**을 알고 있어야 내 프로젝트의 목적에 맞는 구체적이고 명확한 요구사항 전달 가능

---

## 4. 협업과 유지보수
- 다른 사람과 협업할 때, 코드 리뷰나 버전 관리에서 언어에 대한 기본 지식이 필수
- 프로젝트 규모가 커질수록 단순 AI 의존보다는 언어적 이해를 통한 **구조적 접근**이 필요

---

## 5. 창의적 문제 해결
- 프로그래밍 언어는 단순히 명령어 집합이 아닌 **문제 해결 도구**
- 프로그래밍 언어를 이해하면 AI가 제시하지 않은 새로운 해결 방법을 직접 고안

---



<br><br>

## 1. 웹페이지가 동작하는 원리

웹서비스는 크게 **프론트엔드**, **백엔드(API 서버)**, **데이터베이스(DB)** 로 이루어진다.

### 구조 다이어그램
```
    [사용자]
       │
       ▼
 ┌────────────┐
 │ 프론트엔드   │ (HTML, Streamlit, React)
 └────────────┘
       │ API 요청 (예: 사용자 질문)
       ▼ API 응답 (예: AI 답변)
 ┌────────────┐
 │  백엔드     │ (RAG, LLM, 생성형 AI 관련 로직 // C/C++, Java, Python)
 └────────────┘
       │ 데이터 요청 (예: 회원 정보 확인)
       ▼ 
 ┌────────────┐
 │   DB       │ (회원, 게시글, 챗봇에 활용할 데이터 저장)
 └────────────┘
```

### 식당을 예로 들면...

#### 클라이언트 (고객)
 - 식당 손님

#### 서버 (식당)
- 식당문 = 도메인 주소(http://127.0.0.1:8000)
- 메뉴판 = 프론트엔드
- 주문 = 클라이언트 요청(request // GET, POST)
- 종업원 = API
- 주방 = 백엔드
- 식품 창고 = DB
- 요리 = 서버 응답(response)

#### 내부 개발 단계 : 내 PC에서 작업 (로컬)
 - 식당문 닫고 메뉴 개발중....(http://localhost:8000)
 - 메뉴 개발자가 곧 손님

#### 서비스 배포 단계 : 외부 서버 PC에 프로젝트 업로드 (GCP, AWS등 외부 VM)
 - 식당문 열고 오픈!

---
<br><br>

## 2. 웹페이지 구성 방식 비교 (HTML / Streamlit / React)

| 개발 방식 | 특징 | 장점 | 단점 |
|-----------|------|------|------|
| **HTML** | 웹의 기초 언어(정적 페이지)<br>보통 JavaScript와 함께 활용 | 단순하고 구현하기 쉬움 | 동적 기능 구현이 어려움<br>(게시판, 커뮤니티 사이트) |
| **Streamlit** | 간단한 프로토타입 제작<br>Python + React 결합된 템플릿 구조 | 빠르고 간편함. | 실제 서비스 상용화엔 부적합<br>(커스터마이징 X) |
| **React** | JavaScript 기반 프레임워크<br>동적인 UI 개발에 최적화 | 실제 서비스 개발에 활용<br>(ChatGPT, Instagram 등...) | 컴포넌트와 상태변수, 비동기 처리에 대한 이해 필요 (어려움) |

### 📄 코드 예시

#### HTML
```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Hello</h1>
    <button onclick="alert('Hi!')">Click</button>
  </body>
</html>
```

#### Streamlit
```python
import streamlit as st

st.title("Chatbot")
msg = st.text_input("Ask:")
if msg:
    st.write("You said:", msg)
```

#### React
```jsx
import React, { useState } from 'react';

function Chat() {
  const [msg, setMsg] = useState("");
  return (
    <div>
      <h1>Chatbot</h1>
      <input value={msg} onChange={e => setMsg(e.target.value)} />
      <p>{msg}</p>
    </div>
  );
}

export default Chat;
```

👉 요약  
- **HTML**: 정적 웹페이지 제작 
- **Streamlit**: 프로젝트 프로토타입 제작 (쉽지만 커스터마이징 X)
- **React**: 실제 상호작용 서비스 개발 (어렵지만 커스터마이징 O)

---
<br><br>

## 3. 백엔드 언어 비교

| 언어 | 특징 | 장점 | 단점 | 주요 쓰임새 |
|------|------|------|------|-------------|
| **C** | 최저수준 절차지향 언어<br>시스템 제어 가능 | 빠른 실행 속도,<br>하드웨어 제어 | 문법이 복잡<br>생산성 낮음 | 운영체제, 임베디드, 우주 탐사선 |
| **C++** | C 기반 객체지향 언어 | 성능 + 객체지향,<br>대규모 프로젝트에 강함 | 러닝커브 높음<br>복잡성 | 게임 개발 |
| **Java** | JVM 기반 범용 언어 | 플랫폼 독립적, 안정적 | 속도가 C/C++보다 느림 | 금융권, 공공기관 등 대규모 서비스 |
| **Python** | 인터프리터 언어 | 간결한 문법<br>빠른 개발<br>AI 관련 다양한 라이브러리 | 실행속도 느림<br>메모리 사용량 많음 | AI, 데이터 과학, 영상/이미지 처리 |

---

<br><br>

## 4. 백엔드 언어별 코드 비교

오름차순 정렬 문제
```py
[2, 5, 3, 6, 7, 1, 9, 4, 8] --> [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

### C++
```cpp
extern "C" int write(int fd, const void* buf, unsigned int count);

void printChar(char c) {
    write(1, &c, 1);
}

void printInt(int num) {
    if (num == 0) {
        printChar('0');
        return;
    }
    char buf[10];
    int idx = 0;
    while (num > 0) {
        buf[idx++] = (num % 10) + '0';
        num /= 10;
    }
    for (int i = idx - 1; i >= 0; i--) {
        printChar(buf[i]);
    }
}

void printSpace() {
    printChar(' ');
}

int main() {
    int numbers[9] = {2, 5, 3, 6, 7, 1, 9, 4, 8};
    int n = 9;

    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (numbers[j] > numbers[j + 1]) {
                int temp = numbers[j];
                numbers[j] = numbers[j + 1];
                numbers[j + 1] = temp;
            }
        }
    }

    for (int i = 0; i < n; i++) {
        printInt(numbers[i]);
        printSpace();
    }
    return 0;
}
```

### Java
```java
public class Main {
    public static void main(String[] args) {
        int[] numbers = {2, 5, 3, 6, 7, 1, 9, 4, 8};
        int n = numbers.length;

        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (numbers[j] > numbers[j + 1]) {
                    int temp = numbers[j];
                    numbers[j] = numbers[j + 1];
                    numbers[j + 1] = temp;
                }
            }
        }

        for (int i = 0; i < n; i++) {
            System.out.print(numbers[i] + " ");
        }
    }
}
```

### Python
```python
numbers = [2, 5, 3, 6, 7, 1, 9, 4, 8]

numbers.sort()

print(numbers)
```
#### ✅ 실행 결과
```
[1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<br><br>

# 왜 파이썬은 느린데 AI 분야에서 표준 언어로 쓰이나요?

---

## 1. 속도 문제를 보완하는 방식
- 파이썬은 무거운 연산을 직접 하지 않고, **C/C++/CUDA로 구현된 라이브러리**가 처리한다.
  - 예: `numpy`, `pandas`, `scikit-learn`, `PyTorch`, `TensorFlow`
- 파이썬은 **인터페이스(껍데기)** 역할만 하고, 실제 연산은 이미 고속 언어에서 실행된다.

---

## 2. 생산성 & 간결성
- 문법이 단순하고 직관적이어서 **아이디어를 빠르게 코드로 구현**할 수 있다.
- AI 연구는 실험과 프로토타입 반복이 많기 때문에, 개발 속도가 매우 중요하다.

---

## 3. 풍부한 라이브러리 & 커뮤니티
- 머신러닝/딥러닝 관련 **라이브러리 대부분이 파이썬 중심**으로 발전했다.
  - PyTorch, TensorFlow, Keras, HuggingFace Transformers, scikit-learn 등
- 연구 논문과 튜토리얼도 파이썬 코드로 제공되는 경우가 많아 **사실상 표준 생태계**가 됐다.

---

## 4. 다른 언어와의 연결 용이성
- 파이썬은 **C/C++ 확장 모듈**을 쉽게 불러올 수 있다.
- 성능이 중요한 부분은 C++/CUDA로 구현하고, 나머지는 파이썬으로 감싸는 방식이 일반적이다.
- 예: PyTorch → 핵심은 C++/CUDA, 인터페이스는 파이썬

---

## 5. GPU & 분산 처리 지원
- NVIDIA CUDA, cuDNN 같은 저수준 라이브러리를 직접 쓰려면 C++/CUDA 지식이 필요하다.
- 하지만 파이썬 라이브러리(PyTorch, TensorFlow)가 이를 **손쉽게 추상화**해 제공하기 때문에,
  연구자와 개발자가 GPU 자원을 쉽게 활용할 수 있다.

---

## 비유
- **C++/CUDA** : 고성능 엔진 (차를 실제로 움직이는 핵심 기계)  
- **Python** : 운전자가 쉽게 다룰 수 있는 핸들, 버튼, 대시보드 (인터페이스)

---

## 결론
파이썬은 속도가 빠르지 않다. 하지만  
- **개발 속도**  
- **풍부한 생태계**  
- **C++/GPU 연동성**  

때문에 AI 분야에서는 가장 널리 쓰이는 언어가 되었다.

---


## 5. 파이썬 기초 이론

---

### 0. print 구문
```python
print("Hello, World!")
```
✅ 실행 결과:
```
Hello, World!
```
👉 `print()`는 화면에 출력을 보여주는 가장 기본적인 함수다.

---

### 1. 변수 (Variable)
```python
name = "Chatbot"
age = 3

print(name)
```
✅ 실행 결과:
```
Chatbot
```
👉 변수는 데이터를 담는 상자와 같으며, `print()`로 꺼내볼 수 있다.

---

### 2. 자료형 (Data Types)
```python
text = "Hello"                # 문자열
num = 10                      # 정수
pi = 3.14                     # 실수
fruits = ["사과", "바나나"]   # 리스트
student = {"이름": "철수", "나이": 12}  # 딕셔너리

print(type(text))
print(type(num))
print(type(pi))
print(type(fruits))
print(type(student))
```
✅ 실행 결과:
```
<class 'str'>
<class 'int'>
<class 'float'>
<class 'list'>
<class 'dict'>
```
👉 `type()` 함수는 자료형을 확인할 수 있다.

---

### 3. 조건문 (if)
```python
age = 20
if age >= 19:
    print("성인입니다")
else:
    print("미성년자입니다")
```
✅ 실행 결과:
```
성인입니다
```
👉 조건문은 **“만약 ~라면”** 상황을 표현한다.

---

### 4. 반복문 (for)
```python
for i in range(3):
    print("안녕", i)
```
✅ 실행 결과:
```
안녕 0
안녕 1
안녕 2
```
👉 같은 일을 반복하는 구조다.

---

### 5. 함수 (def)
```python
def greet(name):
    return f"안녕, {name}"

print(greet("영희"))
```
✅ 실행 결과:
```
안녕, 영희
```
👉 함수를 사용하면 **코드를 묶어서 재사용**할 수 있다.

---

### 6. 클래스 (class)
```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def introduce(self):
        return f"저는 {self.name}, {self.age}살 입니다."

p = Person("철수", 20)
print(p.introduce())
```
✅ 실행 결과:
```
저는 철수, 20살 입니다.
```
👉 클래스는 **사람, 자동차, 동물**처럼 현실의 개념을 코드로 표현할 때 사용한다.  
👉 `__init__`은 생성자 메서드로, 객체가 만들어질 때 자동으로 실행된다.

---

### 7. 예외 처리 (try / except)
```python
try:
    x = int("hello")  # 문자열을 숫자로 변환 → 오류 발생
except ValueError:
    print("숫자로 변환할 수 없습니다.")
```
✅ 실행 결과:
```
숫자로 변환할 수 없습니다.
```
👉 오류가 발생해도 프로그램이 멈추지 않고, **대처 방법**을 지정할 수 있다.

---

### 8. 모듈 불러오기 (import / from / as)
```python
# math 모듈 전체 불러오기
import math
print(math.sqrt(16))

# 모듈에서 특정 함수만 불러오기
from math import sqrt
print(sqrt(25))

# 모듈에 별칭(alias) 붙여서 불러오기
import math as m
print(m.pi)
```
✅ 실행 결과:
```
4.0
5.0
3.141592653589793
```
📌 설명:
- `import math` → math 모듈 전체 사용 (`math.sqrt()` 처럼 모듈명 필요)  
- `from math import sqrt` → `sqrt()` 함수만 직접 사용 가능  
- `import math as m` → 모듈에 별칭을 붙여 짧게 사용 가능 (`m.pi`)  

---

### 9. 파일 실행 (if __name__ == "__main__")
```python
def main():
    print("이 파일을 직접 실행했을 때만 동작합니다.")

if __name__ == "__main__":
    main()
```
✅ 직접 실행 시 출력:
```
이 파일을 직접 실행했을 때만 동작합니다.
```

📌 설명:
- `__name__` 은 파이썬이 자동으로 부여하는 특별 변수.  
- 이 파일을 직접 실행하면 `__name__ == "__main__"` 이 성립 → `main()` 실행.  
- 다른 파일에서 import 하면 `__name__`은 모듈명이 되므로 실행되지 않는다.  
- 언더바 두 개(`__`)는 **던더 네임(Dunder Name)** 규칙으로, 파이썬에서 특별한 시스템 이름임을 뜻한다.  

---

## 7. VS Code IDE와 터미널

### VS Code
- 코드 작성, 실행, 디버깅, 깃허브 연동 가능

### 터미널
```
$ python main.py          # 파이썬 실행
$ pip install requests    # 라이브러리 설치
$ git commit -m "Update"  # 깃허브 저장
```

---

## 8. 프로젝트 구성 파일

터미널에 tree 명령어를 실행하면..
```
LLM_Chatbot/
├─ README.md        ← 프로젝트 설명
├─ requirements.txt ← 필요한 라이브러리 목록
├─ .env             ← API 키 등 비밀값
├─ .gitignore       ← 무시할 파일 목록
└─ app.py          ← 실행 파일
```

- **README.md** → 설명서  
- **requirements.txt** → 필요한 라이브러리 목록  
- **.env** → 비밀값 저장 (절대 공개 ❌)  
- **.gitignore** → 무시할 파일 지정  

---

## 9. 깃허브 버전관리

- 코드 이력 관리  
- 협업 필수  
- 과거 버전 복구 가능  

---

## 10. API와 RESTful API

### API (Application Programming Interface)
- 프로그램끼리 통신할 수 있는 규약(인터페이스)
- 예: 라이브러리 API, 운영체제 API, 웹 API 등

### Web API → API의 한 분야
- 인터넷(HTTP 프로토콜)을 통해 다른 프로그램과 데이터를 주고받는 API
- 예: OpenAI API, Google Maps API

### RESTful API→ Web API 구현 방식 중 하나
- REST (Representational State Transfer) 라는 아키텍처 스타일을 따르는 Web API

- 규칙을 지켜서 설계된 API를 RESTful API라고 부름

#### RESTful API 특징(규칙)
- 자원(Resource): URI로 표현 (`/users`)  
- 행위(Method): HTTP 메서드로 정의 (GET/POST/PUT/DELETE)  
- 표현(Representation): JSON 형식 응답
- 무상태성(Stateless): 서버는 클라이언트 상태를 기억하지 않음 → 요청마다 필요한 정보 포함해야 함  

#### 예시 요청
| 요청 | 의미 |
|------|------|
| GET /users | 사용자 목록 조회 |
| POST /users | 새 사용자 생성 |
| PUT /users/{id} | 특정 사용자정보 전체 수정(덮어쓰기) |
| DELETE /users/{id} | 특정 사용자정보 삭제 |

### RESTful API 호출 예시
```python
import requests

res = requests.get("https://api.github.com/users/octocat")

print("상태 코드:", res.status_code)
print("데이터:", res.json())
```

<br><br>

# GitHub + Conda + VS Code 실습 가이드

## 1. GitHub 프로젝트 준비
1. **GitHub에서 새 레포지토리 생성**
   - 이름 예시: `LLM_Chatbot`
   - `README.md`, `.gitignore`는 로컬에서 직접 만들 예정 → 생성 시 체크하지 않음.

2. **로컬에 Clone**
   ```bash
   git clone https://github.com/<username>/LLM_Chatbot.git
   cd LLM_Chatbot
   ```

---

## 2. 프로젝트 초기 설정
3. **기본 파일 생성**
   - `README.md` : 프로젝트 설명
   - `.gitignore` : Python, Jupyter 관련 템플릿
   - `.env` : 환경변수 예시 파일
   - `requirements.txt` : 의존성 모듈 리스트

4. **Git add/commit/push**
   ```bash
   git add .
   git commit -m "Add project base files"
   git push origin main
   ```

---

## 3. 가상환경 & 패키지 설치
5. **conda로 가상환경 생성**
   ```bash
   conda create -n myenv python=3.11 -y
   conda activate myenv

   # 삭제
   conda remove -n myenv --all
   ```

6. **의존성 설치**
   ```bash
   pip install -r requirements.txt
   ```

---

## 4. 환경 세팅
7. **VSCODE 확장팩(Extension) 설치**
   - Python
   - Python Environments
   - Pylance
   - Jupyter


8. **VS Code에서 `.ipynb` 파일 실행**
   - 코드블록에 커서 놓고 -> Ctrl + Enter
   - 오른쪽 상단에서 **Kernel 선택 → `myenv` 선택**
   - 새 코드블록 생성 : Esc + B
   - 코드블록 나누기 : Ctrl + Shift + -
---

## 5. 코드 실습
9. **Notebook 코드 작성**
   ```python
   print("Hello, Python")
   ```


