class Car:
    __speed = 0
    _name = ""
    def __init__(self, name):
        self._name = name

    def set_speed(self, speed):
        if speed < 0:
            self.__speed = 0
        else:
            self.__speed = speed

    def get_speed(self):
        return self.__speed

car1 = Car("BMW")
car1.set_speed(100)
print(f"current speed {car1.get_speed()}")
car1.set_speed(-1)
print(f"current speed {car1.get_speed()}")