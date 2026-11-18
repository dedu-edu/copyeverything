a = 0
b = 1
while b < 1000:
    temp = a
    a = b
    b = b + temp
    if len(str(b)) == 3:
        print(b)


