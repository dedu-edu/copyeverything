size1 = int(input("enter the size of the array: "))
numbers1 = []
for i in range(size1):
    num = int(input(f"enter your {i+1}th number: "))
    numbers1.append(num)
size2 = int(input("enter the size of the array: "))
numbers2 = []
for i in range(size2):
    num = int(input(f"enter your {i+1}th number: "))
    numbers2.append(num)
print(numbers1 + numbers2)
