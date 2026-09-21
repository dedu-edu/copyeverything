n = int(input("enter the size of the array: "))
number = []
most_common = 0
rept = 1
for i in range(n):
    num = int(input(f"enter your {i+1}th number: "))
    number.append(num)
number = sorted(number)
for i in range(n):
    for k in range(i, n-1):
        if number[i] == number[i + 1]:
            current_rept = rept + 1
    if current_rept > rept:
        rept = current_rept
        most_common = number[i]

print(f"most common number is {number[most_common]}, repetition is {rept}")