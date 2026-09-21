class Vehicle:
    name = ""
    owner = ""
    def __init__(self, name, owner):
        self.name = name
        self.owner = owner

    def move(self):
        print("Moving " + self.name)

class Car(Vehicle):
    def __init__(self, name, owner):
        super().__init__(name, owner)

    def move(self):
        print("Driving")

class Bicycle(Vehicle):
    def __init__(self, name, owner):
        super().__init__(name, owner)

    def move(self):
        print("Turning the pedal")

class Airplane(Vehicle):
    def __init__(self, name, owner):
        super().__init__(name, owner)

    def move(self):
        print("Flying")

class Boat(Vehicle):
    def __init__(self, name, owner):
        super().__init__(name, owner)

    def move(self):
        print("floating")

def move(vehicle):
    vehicle.move()


car1 = Car("Toyota", "William")
move(car1)
bicycle1 = Bicycle("BMX", "William")
move(bicycle1)
airplane1 = Airplane("Boeing737", "William")
move(airplane1)
boat1 = Boat("Yacht", "William")
move(boat1)