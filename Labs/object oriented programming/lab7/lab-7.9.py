class Animal:
    name = ""
    age = 0
    def __init__(self, name, age):
        self.name = name
        self.age = age

class Lion(Animal):
    def __init__(self, name, age):
        super().__init__(name, age)

    def make_sound(self):
        print("ROAR")

    def move(self):
        print("sprint")

class Elephant(Animal):
    def __init__(self, name, age):
        super().__init__(name, age)

    def make_sound(self):
        print("Toot Toot")

    def move(self):
        print("walking slowly")

class Monkey(Animal):
    def __init__(self, name, age):
        super().__init__(name, age)

    def make_sound(self):
        print("Unga Bunga")

    def move(self):
        print("climbing trees")

lion1 = Lion("Lion", 5)
monkey = Monkey("Monkey", 5)
elephant = Elephant("Elephant", 5)
animals = [lion1, monkey, elephant]
for animal in animals:
    animal.make_sound()
    animal.move()


