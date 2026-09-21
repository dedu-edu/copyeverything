n = int(input("enter the size of the array: "))
number = []
for i in range(n):
    num = int(input(f"enter your {i+1}th number: "))
    number.append(num)
number = sorted(number)
min_diff = max(number)
for i in range(n):
    for k in range(i,n-1):
        if number[i+1] - number[i] < min_diff:
            min_diff = number[i+1] - number[i]
print(f'smallest diff between num in array is {min_diff}')