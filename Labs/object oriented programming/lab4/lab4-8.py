class Rectangle:
    __width = 0
    __height = 0
    def __init__(self, width, height):
        self.__width = width
        self.__height = height

    @property
    def dimensions(self):
        return [self.__width, self.__height]

    @dimensions.setter
    def dimensions(self, dimensions):
        if dimensions[0] < 0:
            self.__width = 0
        else:
            self.__width = dimensions[0]

        if dimensions[1] < 0:
            self.__height = 0
        else:
            self.__height = dimensions[1]

obj1 = Rectangle(100, 300)
print(obj1.dimensions)
obj1.dimensions = [200,500]
print(obj1.dimensions)
obj1.dimensions = [-100,-100]
print(obj1.dimensions)