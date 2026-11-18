n = int(input("Enter n: "))
digit_count = 0
number = n
n = abs(n)
if n == 0:
    digit_count += 1
else:
    while n != 0:
        n = n // 10
        digit_count += 1

print(f"{number} has {digit_count} digits")