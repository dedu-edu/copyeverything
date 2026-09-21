def perfect_number(given_number):
    sum = 0
    for i in range(1,given_number):
        if given_number % i == 0:
            sum += i
    if sum == given_number:
        print(f"This number is perfect!!!")
    elif sum != given_number:
        print(f"This number is not perfect!!!")

perfect_number(int(input("Enter a number: ")))