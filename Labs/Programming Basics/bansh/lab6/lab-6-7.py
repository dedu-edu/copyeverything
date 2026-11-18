k = int(input("Enter K: "))
rList = []
a = 0
b = 1
if k == 1:
    print(a)
elif k == 2:
    print([a,b])
else:
    for i in range(k):
        if i == 0:
            rList.append(a)
        elif i == 1:
            rList.append(b)
        else:
            temp = a
            a = b
            b = b + temp
            rList.append(b)
    print(rList)

