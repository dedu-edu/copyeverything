n = int(input("enter the size of the array: "))
number = []
prefix_sum = []
sum = 0
for i in range(n):
    num = int(input(f"enter your {i+1}th number: "))
    number.append(num)
for i in range(n):
    sum += number[i]
    prefix_sum.append(sum)
print(number)
print(prefix_sum)