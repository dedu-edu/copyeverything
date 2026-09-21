n = int(input("enter the size of the array: "))
number = []
for i in range(n):
    num = int(input(f"enter your {i+1}th number: "))
    number.append(num)
print("max number in the array: ",max(number))