# 🧭 Cursor AI 초기 설정 가이드 (VS Code와 동일한 UI 세팅)

> 이 문서는 **Cursor AI**를 설치한 직후,  
> **VS Code와 최대한 유사한 인터페이스 및 편집 환경**으로 맞추는 가이드입니다.

---

## 🧩 1. 기본 설치

### 1.1 Cursor 다운로드
- 공식 사이트: [https://www.cursor.sh](https://www.cursor.sh)
- OS별 설치 지원:
  - Windows (.exe)
  - macOS (Intel / Apple Silicon)
  - Linux (AppImage)

설치 후 최초 실행 시 GitHub 로그인이 필요합니다.  
GitHub 계정을 통해 클라우드 동기화 기능을 활성화하세요.

---

## 🎨 2. VS Code와 동일한 테마 및 아이콘 설정

### 2.1 테마 변경
1. **Ctrl + Shift + P** 실행  
2. 검색창에 `Color Theme` 입력  
3. `Preferences: Color Theme` 선택  
4. 원하는 테마 선택 (예: *Dark+*, *Light+*, *Monokai*)

---

### 2.2 아이콘 테마 맞추기
1. 명령 팔레트 열기 (`Ctrl + Shift + P`)  
2. `File Icon Theme` 검색 → `"Set File Icon Theme"` 선택  
3. VS Code 기본 아이콘 테마 선택: **Seti (Visual Studio Code)**  

---

## ⚙️ 3. 에디터 기본 설정 조정

### 3.1 자동 줄바꿈
```json
"editor.wordWrap": "on"
```

### 3.2 탭 크기와 들여쓰기
```json
"editor.tabSize": 4,
"editor.insertSpaces": true
```

### 3.3 미니맵 설정
```json
"editor.minimap.enabled": true
```

### 3.4 괄호 색상 구분
```json
"editor.bracketPairColorization.enabled": true
```

### 3.5 파일 저장 시 포맷 자동화
```json
"editor.formatOnSave": true
```

> ✅ 위 설정은 VS Code 기본 설정(`settings.json`)과 동일하게 동작합니다.

---

## 🧠 4. AI 관련 기능만 부분적으로 비활성화하기

Cursor에는 AI 코드 어시스트가 기본 내장되어 있지만,  
원할 경우 일부 기능을 끌 수 있습니다.

```json
"cursor.suggestions.enabled": false,
"cursor.autocomplete.inline": false,
"cursor.chat.sidebar.enabled": false
```

> 📌 이렇게 하면 기본 편집창은 VS Code와 거의 동일한 형태로 유지되고,  
> 필요할 때만 `Cmd + K` → "Ask Cursor" 명령으로 AI를 호출할 수 있습니다.

---

## 🪄 5. 사이드바 & 레이아웃 정렬

| 항목 | VS Code 기본 위치 | Cursor에서 조정 방법 |
|------|------------------|----------------------|
| **Explorer** | 왼쪽 | `Ctrl + B` |
| **Terminal** | 하단 | `Ctrl + `` (백틱)` |
| **Search** | 왼쪽 | `Ctrl + Shift + F` |
| **Source Control (Git)** | 왼쪽 | `Ctrl + Shift + G` |
| **Extensions** | 왼쪽 | `Ctrl + Shift + X` |
| **Command Palette** | 상단 | `Ctrl + Shift + P` |

> ⚙️ Cursor는 VS Code의 키맵을 완벽히 호환하므로 위 단축키는 그대로 사용 가능.

---

## 💻 6. VS Code 설정 가져오기

Cursor는 VS Code의 설정 파일을 자동 감지합니다.  
만약 VS Code에서 쓰던 설정을 그대로 옮기고 싶다면:

### 6.1 Windows
```
%APPDATA%\Code\User\settings.json
```

### 6.2 macOS / Linux
```
~/.config/Code/User/settings.json
```

이 파일을 Cursor 설정 폴더에 복사:
```
~/.cursor/User/settings.json
```

> 💡 대부분의 VS Code 확장 및 설정이 그대로 반영됩니다.

---

## 📦 7. 필수 확장 추천 (VS Code와 동일하게)

| 카테고리 | 확장명 | 설명 |
|-----------|--------|------|
| Python | `ms-python.python` | 파이썬 실행 / 디버깅 |
| Lint | `ms-python.black-formatter` | 코드 자동 정렬 |
| Markdown | `yzhang.markdown-all-in-one` | 마크다운 미리보기 |
| Git | `eamodio.gitlens` | Git 히스토리 시각화 |
| JSON / YAML | `redhat.vscode-yaml` | 설정 파일 인텔리센스 |

---

## 🧩 8. 단축키 동기화 (VS Code와 완전 동일하게)

명령 팔레트(`Ctrl + Shift + P`) →  
`Keyboard Shortcuts: Open Keyboard Shortcuts (JSON)` →  
VS Code의 `keybindings.json` 내용을 복사해서 붙여넣으면 완전 동일한 단축키 세팅 가능.

---

## ✅ 최종 체크리스트

- [x] 테마 및 아이콘 VS Code와 동일  
- [x] 기본 편집기 설정(`wordWrap`, `formatOnSave`) 동일  
- [x] 미니맵, 괄호 색상, 줄 번호 표시 정상  
- [x] 사이드바, 터미널 위치 동일  
- [x] 단축키 완벽 호환  

---

## 📚 참고 링크
- [Cursor 공식 문서](https://docs.cursor.sh)
- [VS Code Keymap for Cursor (GitHub)](https://github.com/getcursor/cursor)
- [VS Code 설정 백업/복원 가이드](https://code.visualstudio.com/docs/editor/settings)

---

