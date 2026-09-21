size1 = int(input("enter the size of the array: "))
number1 = []
sum1 = 0
for i in range(size1):
    num = int(input(f"enter your {i+1}th number: "))
    number1.append(num)
    sum1 += num
size2 = int(input("enter the size of the array: "))
number2 = []
sum2 = 0
for i in range(size2):
    num = int(input(f"enter your {i+1}th number: "))
    number2.append(num)
    sum2 += num
print(sum1 - sum2)