a = int(input("please enter 1st number? "))
b = int(input("please enter 2nd number? "))
c = int(input("please enter 3rd number? "))
d = int(input("please enter 4th number? "))
if a%11!=0:
    if b%11!=0:
        if c%11!=0:
            if d%11!=0:
                print(a+b+c+d)
            elif d%11==0:
                print(a+b+c)
        elif c%11==0:
            if d%11!=0:
                print(a+b+d)
            elif d%11==0:
                print(a+b)
    elif b%11==0:
        if c%11!=0:
            if d%11!=0:
                print(a+c+d)
            elif d%11==0:
                print(a+c)
        elif c%11==0:
            if d%11!=0:
                print(a+d)
            elif d%11==0:
                print(a)
elif a%11==0:
    if b%11!=0:
        if c%11!=0:
            if d%11!=0:
                print(b+c+d)
            elif d%11==0:
                print(b+c)
        elif c%11==0:
            if d%11!=0:
                print(b+d)
            elif d%11==0:
                print(b)
    if b%11==0:
        if c%11!=0:
            if d%11!=0:
                print(c+d)
            elif d%11==0:
                print(c)
        elif c%11==0:
            if d%11!=0:
                print(d)
            elif d%11==0:
                print("all of them can be divided by 11")