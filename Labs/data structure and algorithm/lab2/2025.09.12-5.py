n = int(input("enter the size of the array: "))
number = []
for i in range(n):
    num = int(input(f"enter your {i+1}th number: "))
    number.append(num)
max_ind = number.index(max(number))
min_ind = number.index(min(number))
print(max_ind, min_ind)