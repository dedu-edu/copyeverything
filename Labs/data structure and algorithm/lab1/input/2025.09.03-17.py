a = int(input("enter num a: "))
b = int(input("enter num b: "))
c = int(input("enter num c: "))
if a > b:
    if a > c:
        print(f"{a} is the biggest num")
    else:
        print(f"{c} is the biggest num")
elif b > a:
    if b > c:
        print(f"{b} is the biggest num")
    else:
        print(f"{c} is the biggest num")
elif c > b:
    if a > c:
        print(f"{a} is the biggest num")
    else:
        print(f"{c} is the biggest num")