def armstrong_number(n,m):
    import math
    for i in range(n,m+1):
        k = i
        sum = 0
        for j in range(len(str(k))):
            sum += pow(i % 10,len(str(k)))
            i = math.floor(i / 10)
        if sum==k:
            print(k)
        sum = 0

armstrong_number(int(input("Please enter the starting number: ")),int(input("Please enter the ending number: ")))