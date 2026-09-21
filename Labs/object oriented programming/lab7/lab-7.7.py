class Person:
    name = ""
    age = 0
    def __init__(self, name, age):
        self.name = name
        self.age = age

class Student(Person):
    grade = 0
    def __init__(self, name, age, grade):
        super().__init__(name, age)
        self.grade = grade

    def introduce(self):
        return f'hi! my name is {self.name},  {self.age} years old, grade is {self.grade}'

class Teacher(Person):
    subject = ""
    def __init__(self, name, age, subject):
        super().__init__(name, age)
        self.subject = subject

    def introduce(self):
        return f'hi! my name is {self.name},  {self.age} years old, i teach {self.subject}'

student1 = Student("Will", 16, 100)
teacher1 = Teacher("Josephus", 21, "Python")
print(student1.introduce())
print(teacher1.introduce())