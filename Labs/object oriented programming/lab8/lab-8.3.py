import math


class Shape:
    dimensions = []
    def __init__(self,dimensions):
        self.dimensions = dimensions

    def area(self):
        return self.dimensions[0]*self.dimensions[1]

class Circle(Shape):
    def __init__(self,dimensions):
        super().__init__(dimensions)

    def area(self):
        return round(math.pi*self.dimensions[0]**2, 2)

class Rectangle(Shape):
    def __init__(self,dimensions):
        super().__init__(dimensions)

    def area(self):
        return self.dimensions[0]*self.dimensions[1]

class Triangle(Shape):
    def __init__(self,dimensions):
        super().__init__(dimensions)

    def area(self):
        pr = (self.dimensions[0] + self.dimensions[1] + self.dimensions[2])/2
        return round(math.sqrt(pr*(pr-self.dimensions[0])*(pr-self.dimensions[1])*(pr-self.dimensions[2])), 2)

def area_calculator(shape):
    return shape.area()

circle1 = Circle([3])
print(circle1.area())
rect1 = Rectangle([2,3])
print(rect1.area())
triangle1 = Triangle([2,3,4])
print(triangle1.area())