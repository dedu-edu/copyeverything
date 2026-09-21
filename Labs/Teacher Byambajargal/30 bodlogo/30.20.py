import math
n = int(input())
sum = 0
i = 1
while i <= n:
    sum += math.sqrt(i)
    i += 2
print(sum)