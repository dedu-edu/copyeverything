a = (input("please enter the 1st number? "))
b = (input("please enter 2nd number? "))
c = (input("please enter 3rd number? "))
if a>b:
    if a>c:
        print(a + " is the biggest")
    elif c>a:
        print(c + " is the biggest")
elif b>a:
    if b>c:
        print(b + " is the biggest")
    elif c>b:
        print(c + " is the biggest")
elif a==b==c:
    print("all of them are equal")
elif a==b:
    if a>c:
        print(a + " are both the biggest")
    elif c>a:
        print(c + " is the biggest")
elif a==c:
    if a>b:
        print(a + " are both the biggest")
    elif b>a:
        print(b + " is the biggest")
elif b==c:
    if b>a:
        print(b + " are both the biggest")
    elif a>b:
        print(a + " is the biggest")