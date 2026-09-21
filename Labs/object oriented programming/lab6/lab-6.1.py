class Animal:
    name = ""
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, name):
        Animal.__init__(self, name)

    def bark(self):
        print("Woof!")

shepherd = Dog("Shepherd")
print(shepherd.name)
shepherd.bark()