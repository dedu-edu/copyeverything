def armstrong_number():
    import math
    for i in range(100,1000):
        k = i
        sum = 0
        for j in range(3):
            sum += pow(i % 10,3)
            i = math.floor(i / 10)
        if sum==k:
            print(k)
        sum = 0

armstrong_number()