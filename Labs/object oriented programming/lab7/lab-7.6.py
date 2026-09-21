class LivingThing:
    name = ""
    age = 0
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def live(self):
        return True

class Animal(LivingThing):
    def __init__(self, name, age):
        super().__init__(name, age)

    def eat(self):
        return "Eating..."

class Dog(Animal):
    def __init__(self, name, age):
        super().__init__(name, age)

    def bark(self):
        return "WOOF WOOF!!!"

dog1 = Dog("Rex", 5)
print(dog1.eat())
print(dog1.bark())
print(dog1.live())

