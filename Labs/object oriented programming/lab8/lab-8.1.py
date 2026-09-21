class Animal:
    name = ""
    age = 0
    def __init__(self, name, age):
        self.name = name
        self.age = age

class Cat(Animal):
    def __init__(self, name, age):
        super().__init__(name, age)

    def speak(self):
        print("Meow")

class Dog(Animal):
    def __init__(self, name, age):
        super().__init__(name, age)

    def speak(self):
        print("woof")

class Cow(Animal):
    def __init__(self, name, age):
        super().__init__(name, age)

    def speak(self):
        print("Moo")

cat1 = Cat("cat", 1)
dog1 = Dog("dog", 1)
cow1 = Cow("cow", 1)
animals = [cat1, dog1, cow1]
for animal in animals:
    animal.speak()


