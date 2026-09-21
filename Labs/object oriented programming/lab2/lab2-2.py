class Rectangle:
    def __init__(self, width, height):
        self._width = width
        self._height = height

    def area(self):
        return self._width * self._height

    def perimeter(self):
        return 2 * (self._width + self._height)

rect = Rectangle(5, 3)
print(f"the area is {rect.area()}")
print(f"the parametre is {rect.perimeter()}")
