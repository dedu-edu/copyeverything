import math
a = int(input("enter num a: "))
b = int(input("enter num b: "))
c = int(input("enter num c: "))
para = (a + b + c) / 2
area = math.sqrt(para*(para-a)*(para-b)*(para-c))
print("area =", area)