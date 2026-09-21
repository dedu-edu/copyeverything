def fibonacci():
    a, b = 0, 1
    for i in range(1000):
        a, b = b, a+b
        if len(str(a)) == 3:
            print(a)

fibonacci()