import math


class Shape:
    color = ""
    def __init__(self,color):
        self.color = color

class Circle(Shape):
    radius = 0
    def __init__(self,radius,color):
        self.radius = radius
        Shape.__init__(self,color)

    def area(self):
        return round(math.pi*self.radius**2,3)

circle1 = Circle(1,"red")
print(circle1.color)
print(circle1.area())