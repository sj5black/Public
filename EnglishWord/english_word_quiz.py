import csv
import random
import os


def load_words(difficulty):
    """선택한 난이도에 맞는 CSV 파일을 로드"""
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
    """단어 퀴즈 게임 진행"""
    remaining_words = words.copy()
    correct_count = 0
    incorrect_count = 0
    
    print("\n" + "="*60)
    print("영어 단어 퀴즈를 시작합니다!")
    print(f"총 {len(words)}개의 단어가 준비되어 있습니다.")
    print("종료하려면 'quit' 또는 'q'를 입력하세요.")
    print("="*60 + "\n")
    
    while remaining_words:
        # 랜덤으로 단어 선택
        word = random.choice(remaining_words)
        
        print(f"\n[문제 {len(words) - len(remaining_words) + 1}/{len(words)}]")
        print(f"한국어 뜻: {word['korean_meaning']}")
        print(f"품사: {word['part_of_speech']}")
        
        # 사용자 답변 입력
        user_answer = input("\n영어 단어를 입력하세요: ").strip().lower()
        
        # 종료 명령 확인
        if user_answer in ['quit', 'q']:
            print("\n퀴즈를 종료합니다.")
            break
        
        # 정답 확인
        correct_answer = word['entry'].lower()
        
        if user_answer == correct_answer:
            print("\n✓ 정답입니다! 🎉")
            correct_count += 1
            print(f"예문: {word['example_sentence']}")
            # 정답인 경우 목록에서 제거
            remaining_words.remove(word)
        else:
            print(f"\n✗ 오답입니다.")
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


def main():
    """메인 함수"""
    print("\n" + "="*60)
    print("영어 단어 학습 프로그램")
    print("="*60)
    
    while True:
        print("\n난이도를 선택하세요:")
        print("1. B2 (중상급)")
        print("2. C1 (고급)")
        print("3. C2 (최상급)")
        print("4. 종료")
        
        choice = input("\n선택 (1-4): ").strip()
        
        if choice == '1':
            difficulty = 'B2'
        elif choice == '2':
            difficulty = 'C1'
        elif choice == '3':
            difficulty = 'C2'
        elif choice == '4':
            print("\n프로그램을 종료합니다. 공부하느라 수고하셨습니다!")
            break
        else:
            print("\n잘못된 입력입니다. 1-4 중에서 선택해주세요.")
            continue
        
        # 단어 로드
        words = load_words(difficulty)
        
        if words:
            print(f"\n{difficulty} 난이도 - {len(words)}개의 단어를 로드했습니다.")
            
            # 퀴즈 시작 확인
            start = input("퀴즈를 시작하시겠습니까? (y/n): ").strip().lower()
            if start == 'y':
                quiz_game(words)
            else:
                print("난이도 선택으로 돌아갑니다.")


if __name__ == "__main__":
    main()

