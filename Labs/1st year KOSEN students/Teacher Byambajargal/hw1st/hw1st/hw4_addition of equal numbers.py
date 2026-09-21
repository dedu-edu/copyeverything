a = int(input("please enter the first number: "))
b = int(input("please enter your second number: "))
c = int(input("please enter your third number: "))
if a%2==0:
    if b%2==0:
        if c%2==0:
            g = a+b+c
            print(g)
        elif c%2==1:
            g = a+b
            print(g)
    elif b%2==1:
        if c%2==0:
            g = a+c
            print(g)
        elif c%2==1:
            print(a)
elif a%2==1:
    if b%2==0:
        if c%2==0:
            g = b+c
            print(g)
        elif c%2==1:
            print(b)
    elif b%2==1:
        if c%2==0:
            print(c)
        elif c%2==1:
            print("all of them are inequal numbers")