n = int(input())
sum = 0
max = 0
min = 0
for i in range(1,n+1):
    sum = sum + i
    if i > max:
        max = i
    if i < min:
        min = i
avg = sum/n
print(f"average = {avg}, max = {max}, min = {min}")