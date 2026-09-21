class Employee:
    name = ''
    age = 0
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def work(self):
        return "office work"

class Programmer(Employee):
    def __init__(self, name, age):
        super().__init__(name, age)

    def work(self):
        return "programming"

employee1 = Employee("Johan", 25)
programmer1 = Programmer("William", 18)

print(employee1.work())
print(programmer1.work())