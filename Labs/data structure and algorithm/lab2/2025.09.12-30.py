n = int(input("enter the size of the array: "))
number = []
multi = 1
for i in range(n):
    num = int(input(f"enter your {i+1}th number: "))
    number.append(num)
    multi *= num
print(f'multiplication is: {multi}')
