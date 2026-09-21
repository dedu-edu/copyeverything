import math

class Shape:
    def __init__(self, dimensions):
        self.dimensions = dimensions

    def area(self):
        return ""

class Rectangle(Shape):
    def __init__(self,dimensions):
        super().__init__(dimensions)

    def area(self):
        return self.dimensions[0] * self.dimensions[1]

class Triangle(Shape):
    def __init__(self,dimensions):
        super().__init__(dimensions)
    def area(self):
        p = (self.dimensions[0] + self.dimensions[1] + self.dimensions[2])/2
        return round(math.sqrt(p*(p-self.dimensions[0])*(p-self.dimensions[1])*(p-self.dimensions[2])),2)

class Circle(Shape):
    def __init__(self,dimensions):
        super().__init__(dimensions)
    def area(self):
        return round(math.pi * self.dimensions[0] ** 2,2)

rect1 = Rectangle([3,6])
print(f"area of the object is {rect1.area()}")
tri1 = Triangle([3,6,5])
print(f"area of the triangle is {tri1.area()}")
circ1 = Circle([3])
print(f"area of the circle is {circ1.area()}")

