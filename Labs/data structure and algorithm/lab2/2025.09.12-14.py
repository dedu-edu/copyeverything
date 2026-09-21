n = int(input("enter the size of the array: "))
number = []
exist = False
checking_num = int(input("enter the number to check in array: "))
for i in range(n):
    num = int(input(f"enter your {i+1}th number: "))
    number.append(num)
number = sorted(number)
for i in range(n):
    if number[i] == checking_num:
        exist = True
        break
if exist:
    print("number exist in array")
else:
    print("number dont exist in array")
