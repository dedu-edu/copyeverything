a = int(input("please enter 1st number? "))
b = int(input("please enter 2nd number? "))
c = int(input("please enter 3rd number? "))
d = int(input("please enter 4th number? "))
if a%3==0:
    if b%3==0:
        if c%3==0:
            if d%3==0:
                print(a,b,c,d)
            elif d%3==1 or d%3==2:
                print(a,b,c)
        elif c%3==1 or c%2==2:
            if d%3==0:
                print(a,b,d)
            elif d%3==1 or d%3==2:
                print(a,b)
    elif b%3==1 or b%3==2:
        if c%3==0:
            if d%3==0:
                print(a,c,d)
            elif d%3==1 or d%3==2:
                print(a,c)
        elif c%3==1 or c%3==2:
            if d%3==0:
                print(a,d)
            elif d%3==1 or d%3==2:
                print(a)
elif a%3==1 or a%3==2:
    if b%3==0:
        if c%3==0:
            if d%3==0:
                print(b,c,d)
            elif d%3==1 or d%3==2:
                print(b,c)
        elif c%3==1 or c%3==2:
            if d%3==0:
                print(b,d)
            elif d%3==1 or d%3==2:
                print(b)
    elif b%3==1 or b%3==2:
        if c%3==0:
            if d%3==0:
                print(c,d)
            elif d%3==1 or d%3==2:
                print(c)
        elif c%3==1 or c%3==2:
            if d%3==0:
                print(d)
            elif d%3==1 or d%3==2:
                print("all of them cant be diveded by 3!!!")