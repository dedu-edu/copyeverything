sum = 0
for i in range(100,1000):
    x = i//100+i//10%10+i%10
    if i%x == 0 :
        print(i)
        sum+=1
print(sum)