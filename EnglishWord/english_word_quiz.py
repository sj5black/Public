"""
Import-Csv -Path ".\oxford_C1_words.csv" | Select-Object -ExpandProperty entry > ".\entry_list.txt"
oxford_C1_words.csv 파일의 entry 컬럼값을 추출해서 entry_list.txt 파일에 저장
"""
import csv
import random
import os

# ANSI 색상 코드
class Colors:
    GREEN = '\033[92m'  # 연두색
    RED = '\033[91m'    # 빨간색
    YELLOW = '\033[93m' # 노란색
    BLUE = '\033[94m'   # 파란색
    PURPLE = '\033[95m' # 보라색
    CYAN = '\033[96m'   # 청록색
    WHITE = '\033[97m'  # 흰색
    BOLD = '\033[1m'    # 굵게
    END = '\033[0m'     # 색상 리셋


def load_words(difficulty):
    """선택한 난이도에 맞는 CSV 파일을 로드"""
    if difficulty == 'challenge':
        filename = "oxford_challenge_words.csv"
    elif difficulty == 'under_B2':
        filename = "oxford_under_B2_words.csv"
    else:
        filename = f"oxford_{difficulty}_words.csv"
    
    if not os.path.exists(filename):
        print(f"오류: {filename} 파일을 찾을 수 없습니다.")
        return None
    
    words = []
    with open(filename, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            words.append({
                'entry': row['entry'],
                'part_of_speech': row['part_of_speech'],
                'korean_meaning': row['korean_meaning'],
                'example_sentence': row['example_sentence']
            })
    
    return words


def quiz_game(words):
    """단어 퀴즈 게임 진행 (한국어 뜻 보고 영어 단어 맞추기)"""
    remaining_words = words.copy()
    correct_count = 0
    incorrect_count = 0
    
    print("\n" + "="*60)
    print("영어 단어 퀴즈를 시작합니다! (한국어 뜻 → 영어 단어)")
    print(f"총 {len(words)}개의 단어가 준비되어 있습니다.")
    print("종료하려면 'quit' 또는 'q'를 입력하세요.")
    print("="*60 + "\n")
    
    while remaining_words:
        # 랜덤으로 단어 선택
        word = random.choice(remaining_words)
        
        print(f"\n[문제 {len(words) - len(remaining_words) + 1}/{len(words)}]")
        print(f"한국어 뜻: {word['korean_meaning']} ({word['part_of_speech']})")
        
        # 사용자 답변 입력
        user_answer = input("\n영어 단어를 입력하세요: ").strip().lower()
        
        # 종료 명령 확인
        if user_answer in ['quit', 'q']:
            print("\n퀴즈를 종료합니다.")
            break
        
        # 정답 확인
        correct_answer = word['entry'].lower()
        
        if user_answer == correct_answer:
            print(f"\n{Colors.GREEN}✓ 정답입니다! 🎉{Colors.END}")
            correct_count += 1
            print(f"예문: {word['example_sentence']}")
            # 정답인 경우 목록에서 제거
            remaining_words.remove(word)
        else:
            print(f"\n{Colors.RED}✗ 오답입니다.{Colors.END}")
            incorrect_count += 1
            print(f"정답: {word['entry']}")
            print(f"예문: {word['example_sentence']}")
            # 오답인 경우 목록에 유지 (이미 remaining_words에 남아있음)
        
        # 진행 상황 표시
        print(f"\n남은 단어: {len(remaining_words)}개")
        print("-" * 60)
    
    # 최종 결과 표시
    print("\n" + "="*60)
    print("퀴즈 종료!")
    print(f"정답 개수: {correct_count}")
    print(f"오답 개수: {incorrect_count}")
    if correct_count + incorrect_count > 0:
        accuracy = (correct_count / (correct_count + incorrect_count)) * 100
        print(f"정답률: {accuracy:.1f}%")
    
    if not remaining_words:
        print("\n🎊 축하합니다! 모든 단어를 맞추셨습니다! 🎊")
    
    print("="*60 + "\n")


def meaning_quiz_game(words):
    """뜻 맞추기 퀴즈 게임 진행 (영어 단어 보고 한국어 뜻 맞추기)"""
    remaining_words = words.copy()
    correct_count = 0
    incorrect_count = 0
    
    print("\n" + "="*60)
    print("영어 단어 퀴즈를 시작합니다! (영어 단어 → 한국어 뜻)")
    print(f"총 {len(words)}개의 단어가 준비되어 있습니다.")
    print("종료하려면 'quit' 또는 'q'를 입력하세요.")
    print("="*60 + "\n")
    
    while remaining_words:
        # 랜덤으로 단어 선택
        word = random.choice(remaining_words)
        
        print(f"\n[문제 {len(words) - len(remaining_words) + 1}/{len(words)}]")
        print(f"영어 단어: {word['entry']} ({word['part_of_speech']})")
        print(f"예문: {word['example_sentence']}")
        
        # 5지선다 객관식 보기 생성
        correct_meaning = word['korean_meaning']
        wrong_choices = []
        
        # 다른 단어들의 뜻을 랜덤으로 선택하여 오답 보기 생성
        other_words = [w for w in words if w['korean_meaning'] != correct_meaning]
        if len(other_words) >= 4:
            wrong_choices = random.sample([w['korean_meaning'] for w in other_words], 4)
        else:
            # 단어가 부족한 경우 중복 허용
            wrong_choices = [random.choice([w['korean_meaning'] for w in other_words]) for _ in range(4)]
        
        # 정답과 오답을 섞어서 보기 생성
        all_choices = [correct_meaning] + wrong_choices
        random.shuffle(all_choices)
        
        # 정답의 위치 찾기
        correct_index = all_choices.index(correct_meaning) + 1
        
        # 보기 출력
        print("\n다음 중 올바른 뜻을 선택하세요:")
        for i, choice in enumerate(all_choices, 1):
            print(f"{i}. {choice}")
        
        # 사용자 답변 입력
        user_answer = input("\n선택 (1-5): ").strip()
        
        # 종료 명령 확인
        if user_answer in ['quit', 'q']:
            print("\n퀴즈를 종료합니다.")
            break
        
        # 답변 유효성 검사
        try:
            user_choice = int(user_answer)
            if user_choice < 1 or user_choice > 5:
                print("\n잘못된 입력입니다. 1-5 중에서 선택해주세요.")
                continue
        except ValueError:
            print("\n잘못된 입력입니다. 숫자를 입력해주세요.")
            continue
        
        # 정답 확인
        if user_choice == correct_index:
            print(f"\n{Colors.GREEN}✓ 정답입니다! 🎉{Colors.END}")
            correct_count += 1
            print(f"예문: {word['example_sentence']}")
            # 정답인 경우 목록에서 제거
            remaining_words.remove(word)
        else:
            print(f"\n{Colors.RED}✗ 오답입니다.{Colors.END}")
            incorrect_count += 1
            print(f"정답: {correct_meaning}")
            print(f"예문: {word['example_sentence']}")
            # 오답인 경우 목록에 유지 (이미 remaining_words에 남아있음)
        
        # 진행 상황 표시
        print(f"\n남은 단어: {len(remaining_words)}개")
        print("-" * 60)
    
    # 최종 결과 표시
    print("\n" + "="*60)
    print("퀴즈 종료!")
    print(f"정답 개수: {correct_count}")
    print(f"오답 개수: {incorrect_count}")
    if correct_count + incorrect_count > 0:
        accuracy = (correct_count / (correct_count + incorrect_count)) * 100
        print(f"정답률: {accuracy:.1f}%")
    
    if not remaining_words:
        print("\n🎊 축하합니다! 모든 단어를 맞추셨습니다! 🎊")
    
    print("="*60 + "\n")


def main():
    """메인 함수"""
    print("\n" + "="*60)
    print("영어 단어 학습 프로그램")
    print("="*60)
    
    while True:
        print("\n난이도를 선택하세요:")
        print("1. Under B2 (초중급)")
        print("2. B2 (중상급)")
        print("3. C1 (고급)")
        print("4. C2 (최상급)")
        print("5. Challenge (도전)")
        print("6. 종료")
        
        choice = input("\n선택 (1-6): ").strip()
        
        if choice == '1':
            difficulty = 'under_B2'
        elif choice == '2':
            difficulty = 'B2'
        elif choice == '3':
            difficulty = 'C1'
        elif choice == '4':
            difficulty = 'C2'
        elif choice == '5':
            difficulty = 'challenge'
        elif choice == '6':
            print("\n프로그램을 종료합니다. 공부하느라 수고하셨습니다!")
            break
        else:
            print("\n잘못된 입력입니다. 1-6 중에서 선택해주세요.")
            continue
        
        # 단어 로드
        words = load_words(difficulty)
        
        if words:
            print(f"\n{difficulty.upper()} 난이도 - {len(words)}개의 단어를 로드했습니다.")
            
            # 퀴즈 타입 선택
            print("\n퀴즈 타입을 선택하세요:")
            print("1. 한국어 뜻 → 영어 단어 (기존 방식)")
            print("2. 영어 단어 → 한국어 뜻 (5지선다 객관식)")
            
            quiz_type = input("\n선택 (1-2): ").strip()
            
            if quiz_type == '1':
                # 퀴즈 시작 확인
                start = input("\n퀴즈를 시작하시겠습니까? (y/n): ").strip().lower()
                if start == 'y':
                    quiz_game(words)
                else:
                    print("난이도 선택으로 돌아갑니다.")
            elif quiz_type == '2':
                # 퀴즈 시작 확인
                start = input("\n퀴즈를 시작하시겠습니까? (y/n): ").strip().lower()
                if start == 'y':
                    meaning_quiz_game(words)
                else:
                    print("난이도 선택으로 돌아갑니다.")
            else:
                print("\n잘못된 입력입니다. 1-2 중에서 선택해주세요.")
                continue


if __name__ == "__main__":
    main()

