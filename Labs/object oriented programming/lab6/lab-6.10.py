class Animal:
    name = ""
    def __init__(self, name):
        self.name = name
    def eat(self):
        return "nom nom"

class Bird(Animal):
    def __init__(self, name):
        Animal.__init__(self, name)

    def fly(self):
        return True

bird1 = Bird("Mockingbird")
print(bird1.eat())
print(bird1.fly())