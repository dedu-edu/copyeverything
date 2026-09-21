n = int(input("enter the n: "))
sum = 0
for i in range(1,n+1,2):
    fact = 1
    for j in range(1,i+1):
        fact = fact * j
    sum += fact
print(sum)

