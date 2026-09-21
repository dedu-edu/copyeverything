n = int(input("enter the size of the array: "))
number = []
even_number = []
for i in range(n):
    num = int(input(f"enter your {i+1}th number: "))
    number.append(num)
    if num % 2 == 0:
        even_number.append(num)
print(even_number)