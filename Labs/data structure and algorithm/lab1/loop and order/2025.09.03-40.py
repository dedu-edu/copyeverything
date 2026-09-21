n = int(input("enter the beginning num: "))
count = 0
while n != 1:
    if n % 2 == 0:
        n = n / 2
        count += 1
        print(n)
    else:
        n = n * 3 + 1
        count += 1
        print(n)
print(f'{count} steps needed to reach 1')
