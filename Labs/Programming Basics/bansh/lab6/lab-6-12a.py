a = int(input("Enter a: "))
b = int(input("Enter b: "))
k = int(input("Enter k: "))
ODD = 1
EVEN = 0
for i in range(a, b+1):
    digit_count = 0
    number = i
    while i != 0:
        digit = i % 10
        if digit != 0:
            if digit % 2 == EVEN:
                digit_count += 1
        i = i // 10
    if digit_count == k:
        print(number)