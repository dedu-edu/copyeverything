n = int(input("enter the size of the array: "))
number = []
shifted_number = []
for i in range(n):
    num = int(input(f"enter your {i+1}th number: "))
    number.append(num)
    shifted_number.append(num)
k_space = int(input("enter the spacing size: "))//n
for i in range(n):
    shifted_number[i] = number[-n+k_space+i]
print(shifted_number)



