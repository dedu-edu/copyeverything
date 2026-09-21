class Employee:
    name = ""
    salary = 0
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def display_info(self):
        return f"{self.name} is {self.salary}"

class Manager(Employee):
    department = ""
    def __init__(self, name, salary, department):
        self.department = department
        Employee.__init__(self, name, salary)

    def display_info(self):
        return f"{Employee.display_info(self)}, department:{self.department}"


worker1 = Manager("Hosoo", 18, "human resource")
print(worker1.display_info())