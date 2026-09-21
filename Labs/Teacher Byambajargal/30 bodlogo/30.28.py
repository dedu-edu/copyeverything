t = 0
for x in range(1000,10000):
    q = x // 1000
    w = x // 100 % 10
    e = x % 100 // 10
    r = x % 10

    if q == r:
        if w == e:
            print(x)
            t += 1
print(t)