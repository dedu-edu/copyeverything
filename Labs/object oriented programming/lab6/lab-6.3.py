class Person:
    name = ""
    age = 0
    def __init__(self, name, age):
        self.name = name
        self.age = age

class Student(Person):
    __student_id = ""
    def __init__(self, name, age, student_id):
        self.__student_id = student_id
        Person.__init__(self, name, age)

    def info(self):
        return f"""{self.name} is {self.age} years old
student id: {self.__student_id}"""

student1 = Student("Hosoo", 18, "V.IT23C006")
print(student1.info())