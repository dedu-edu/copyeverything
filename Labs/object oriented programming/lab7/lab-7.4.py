class Person:
    name = ""
    age = 0
    def __init__(self, name, age):
        self.name = name
        self.age = age

class Teacher(Person):
    subject = ""
    def __init__(self, name, age, subject):
        super().__init__(name, age)
        self.subject = subject

person1 = Teacher("John", 22, "Python")
print(person1.name)
print(person1.age)
print(person1.subject)