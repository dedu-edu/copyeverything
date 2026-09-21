class Animal:
    name = ''
    age = 0
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def make_sound(self):
        print('Making sound')

class Dog(Animal):
    def __init__(self, name, age):
        super().__init__(name,age)

    def make_sound(self):
        print('Woof Woof!!!')

class Cat(Animal):
    def __init__(self, name, age):
        super().__init__(name,age)

    def make_sound(self):
        print('Meow Meow!!!')

class Cow(Animal):
    def __init__(self, name, age):
        super().__init__(name,age)

    def make_sound(self):
        print('Moo Moo!!!')

dog = Dog('Dog', 20)
cat = Cat('Cat', 20)
cow = Cow('Cow', 20)
dog.make_sound()
cat.make_sound()
cow.make_sound()