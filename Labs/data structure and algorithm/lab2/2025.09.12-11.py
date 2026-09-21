n = int(input("enter the size of the array: "))
number = []
reversed_number = []
for i in range(n):
    num = int(input(f"enter your {i+1}th number: "))
    number.append(num)
rnum = reversed(number)
for i in rnum:
    reversed_number.append(i)
print(reversed_number)