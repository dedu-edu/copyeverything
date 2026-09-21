class Vehicle:
    brand = ""
    speed = ""
    def __init__(self, brand, speed):
        self.brand = brand
        self.speed = speed

class Car(Vehicle):
    def __init__(self, brand, speed):
        Vehicle.__init__(self, brand, speed)

    def honk(self):
        print("Honk!!")

car1 = Car("ferrari", "300km/s")
print(car1.brand)
print(car1.speed)
car1.honk()