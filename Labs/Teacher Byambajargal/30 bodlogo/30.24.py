x = int(input())
q = 0
fact = 1
for i in range(1,x+1):
    fact = 1
    for j in range(1,i+1):
        fact = fact * j
    q += fact
print(q)
