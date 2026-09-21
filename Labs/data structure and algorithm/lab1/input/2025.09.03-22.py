a = int(input("enter num a: "))
b = int(input("enter num b: "))
c = int(input("enter num c: "))
if a + b >= c and a + c >= b and b + c >= a:
    print("can form a triangle")
else:
    print("can't form a triangle")