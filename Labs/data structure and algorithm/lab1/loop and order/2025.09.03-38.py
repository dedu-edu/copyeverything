#first ever game type of project
#imports for essentials
import random
done = 1
while done == 1:
    secret_number = random.randrange(1, 26)
    i = 2
    d = 0
    if secret_number == 1 or secret_number == 2:
        print("")
    else:
        while i < secret_number:
            if secret_number % i == 0:
                d += 1
                break
            else:
                i += 1

#creating the trial counting

    tries = 1
    while tries <= 5:

#input from hand

        guess = int(input("please enter your guess: "))

#checking if the guess is right

        if guess == secret_number:
            print("congrats")
            done = 2
            break

#tries and their hints

        elif tries<=5:
            print("try again")
            left = 5 - tries
            print(f'{left} tries left')

#first hint if even

            if secret_number % 2 == 0 and tries == 1:
                print("Hint 1: the number is even number")

#first hint if odd

            elif secret_number % 2 == 1 and tries == 1:
                print("Hint 1: the number is odd number")

#second hint if the number is lower than 10

            elif tries == 2 and secret_number < 10:
                print("Hint 2: the number is lower than 10")

#second hint if the number is higher than 10

            elif tries == 2 and secret_number >= 10:
                print("Hint 2: the number is higher or equal than 10")

#third hint if the even number cant be divided by 2

            elif tries == 3 and secret_number % 2 == 0 and secret_number % 4 != 0:
                print("Hint 3: the number cannot be divided by 4")

#third hint if the even number can be divided by 2

            elif tries == 3 and secret_number % 2 == 0 and secret_number % 4 == 0:
                print("Hint 3: the number can be diveded by 4")

#third hint if the odd number cant be divided by 3

            elif tries == 3 and secret_number % 2 == 1 and secret_number % 3 != 0:
                print("Hint 3: the number cannot be diveded by 3")

#third hint if the odd number can be divided by 3

            elif tries == 3 and secret_number % 2 == 1 and secret_number % 3 == 0:
                print("Hint 3: the number can be diveded by 3")

#fourth hint when the number is prime

            elif tries == 4 and d == 0:
                print("Hint 4: the number is a prime number")

#fourth hint when the number is not prime

            elif tries == 4 and d == 1:
                print("Hint 4: the number is a non-prime number")
            else:
                print("game over")
        else:
            print("game over")
        tries += 1

