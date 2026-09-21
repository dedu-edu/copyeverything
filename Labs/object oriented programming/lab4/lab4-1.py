class Person:
    __name = ""
    __age = 0
    def __init__(self, name, age):
        self.__name = name
        self.__age = age

    def get_info(self):
        return f"{self.__name} is {self.__age} years old"

person1 = Person("Socrates", 18)
person2 = Person("von Neumann", 19)
print(person1.get_info())
print(person2.get_info())