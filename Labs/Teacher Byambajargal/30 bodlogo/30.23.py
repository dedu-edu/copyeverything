a = int(input(" "))
b = int(input(" "))
for i in range(a, b+1):
    m = str(i)
    n = len(m)
    m = m[n::-1]
    m = int(m)
    if i > m:
        print(i)
