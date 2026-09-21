n = int(input("enter the size of the array: "))
number = []
binary_number = []
for i in range(n):
    num = int(input(f"enter your {i+1}th number: "))
    number.append(num)
    binary_num = bin(num)
    binary_number.append(binary_num[2:])
print(number)
print(binary_number)