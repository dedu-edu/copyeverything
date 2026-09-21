n = int(input())
sum = 0
for i in range(2,n+1,2):
    pow = i // 2
    sum = sum + (i**pow)
print(sum)