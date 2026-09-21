def find(n,m):
    for i in range(n+1):
        len_number = len(str(i))
        sum = 0
        number = i
        for j in range(len_number):
            sum = sum + (i%10)
            i = i/10
        if pow(sum, 2)==m:
            print(number)

n,m = int(input('enter the limit: ')), int(input("enter the number to be matched: "))
find(n,m)