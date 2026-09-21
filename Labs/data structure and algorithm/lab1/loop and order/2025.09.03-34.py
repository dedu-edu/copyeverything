n = int(input("enter range: "))
even_num = []
odd_num = []
for i in range(n):
    if i == 0:
        continue
    elif i % 2 == 0:
        even_num.append(i)
    else:
        odd_num.append(i)
print(even_num)
print(odd_num)