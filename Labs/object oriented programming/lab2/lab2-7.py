import math
class Circle:
    def __init__(self, radius):
        self._radius = radius
    def area(self):
        print(f"radius is {round(self._radius * pow(math.pi, 2))}")
    def circumference(self):
        print(f"circumference is {round(self._radius * 2 * math.pi)}")

circle1 = Circle(4)
circle1.area()
circle1.circumference()