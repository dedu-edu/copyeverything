running = input("""     quiz game!!!   
        Enter (p) to play!!! or (e) for exit
""")
point = 0
running = running.lower()
if running == 'p':
    answer1 = input("Who was the first president of USA: ")
    answer1 = answer1.lower()
    if answer1 == 'washington':
        point += 1
        print("RIGHT ANSWER!!!")
    else:
        print("WRONG ANSWER!!!")
    answer2 = input("whats 4+4?: ")
    answer2 = answer2.lower()
    if answer2 == "8" or answer2 == "eight":
        point += 1
        print("RIGHT ANSWER!!!")
    else:
        print("WRONG ANSWER!!!")
    answer3 = int(input("How many bits in 4bytes?: "))
    if answer3 == 32:
        point += 1
        print("RIGHT ANSWER!!!")
    else:
        print("WRONG ANSWER!!!")
    answer4 = input("what does IDLE mean?: ")
    answer4 = answer4.lower()
    if answer4 == "integrated development learning environment":
        point += 1
        print("RIGHT ANSWER!!!")
    else:
        print("WRONG ANSWER!!!")
    answer5 = int(input("whats 4^2 + 5^2 ?: "))
    if answer5 == 41:
        point += 1
        print("RIGHT ANSWER!!!")
    else:
        print("WRONG ANSWER!!!")
    percentage = point * 100 / 5
    print(f'your final score is {point}.   {percentage}%')
else:
    print("exited")



