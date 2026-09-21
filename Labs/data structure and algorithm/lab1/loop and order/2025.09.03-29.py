n = int(input())
a = 0
b = 1
if n == 1:
    print(a)
elif n == 2:
    print(a,b)
else:
    for i in range(n):
        print(a)
        temp = a
        a = a+b
        b = temp
