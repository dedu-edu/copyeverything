n = int(input("enter the size of the array: "))
number = []
sum = 0
for i in range(n):
    num = int(input(f"enter your {i+1}th number: "))
    number.append(num)
    if num % 2 == 0:
        sum += num
print(sum/n)
