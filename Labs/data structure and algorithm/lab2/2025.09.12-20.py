n = int(input("enter the size of the array: "))
number = []
new_len = n
for i in range(n):
    num = int(input(f"enter your {i+1}th number: "))
    number.append(num)
number = sorted(number)
for i in range(n):
    for k in range(i, new_len-1):
        if number[i] == number[i+1]:
            number.pop(i+1)
            new_len = len(number)
print(number)