class Temperature:
    __celsius = 0
    def __init__(self, celsius):
        self.__celsius = celsius

    @property
    def celsius(self):
        return f"{self.__celsius}C"

    @property
    def fahrenheit(self):
        return f'{(self.__celsius * 1.8) + 32}F'

    @celsius.setter
    def celsius(self, celsius):
        self.__celsius = celsius

gauge1 = Temperature(27)
print(gauge1.celsius)
print(gauge1.fahrenheit)
gauge1.celsius = 4
print(gauge1.celsius)
print(gauge1.fahrenheit)