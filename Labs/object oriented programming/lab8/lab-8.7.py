class Animal:
    name = ""
    def __init__(self, name):
        self.name = name

    def eat(self):
        print("eating")

class Herbivore(Animal):
    def __init__(self, name):
        super().__init__(name)

    def eat(self):
        print("Eating plants")

class Carnivore(Animal):
    def __init__(self, name):
        super().__init__(name)

    def eat(self):
        print("Eating meat")

class Omnivore(Animal):
    def __init__(self, name):
        super().__init__(name)

    def eat(self):
        print("Eating everything")

def eat(Animal):
    Animal.eat()

pr1 = Carnivore("Animal1")
pr2 = Herbivore("Animal2")
pr3 = Omnivore("Animal3")
Animals = [pr1, pr2, pr3]
for Animal in Animals:
    eat(Animal)