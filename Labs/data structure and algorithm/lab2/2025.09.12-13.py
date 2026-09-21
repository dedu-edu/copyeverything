n = int(input("enter the size of the array: "))
number = []
dup_num = []
for i in range(n):
    num = int(input(f"enter your {i+1}th number: "))
    number.append(num)
number = sorted(number)
for i in range(n):
    for k in range(i, n-1):
        if number[i] not in dup_num:
            if number[i] == number[i + 1]:
                dup_num.append(number[i])
                break
print(dup_num)