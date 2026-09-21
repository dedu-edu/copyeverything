import math
a = int(input("enter the first side: "))
b = int(input("enter the second side: "))
c = int(input("enter the third side: "))

if a + b >= c or b + c >= a or c + a >= b:
    parameter = a + b + c
    parameter_in_equation = parameter / 2
    area = math.sqrt(parameter_in_equation * (parameter_in_equation - a) * (parameter_in_equation - b) * (parameter_in_equation - c))
    print("the area of the triangle is ", area, " the parameter is equal to ", parameter)
else:
    print("not valid sides of an triangle")