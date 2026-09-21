def three_decimal():
    for i in range(100,1000):
        k = str(i)[0:2]
        k = int(k)*5
        if k*5==i:
            print(i)

three_decimal()