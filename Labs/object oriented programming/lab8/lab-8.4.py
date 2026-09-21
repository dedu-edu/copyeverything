class Employee:
    name = ""
    age = 0
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def calculate_salary(self):
        return None

class FullTimeEmployee(Employee):
    __salary = 0
    def __init__(self, name, age, salary):
        super().__init__(name, age)
        self.__salary = salary

    def calculate_salary(self):
        return self.__salary

class PartTimeEmployee(Employee):
    __base_salary = 0
    __hours = 0
    def __init__(self, name, age, base_salary, hours):
        super().__init__(name, age)
        self.__base_salary = base_salary
        self.__hours = hours

    def calculate_salary(self):
        return self.__base_salary * self.__hours


class ContractEmployee(Employee):
    __salary = 0
    def __init__(self, name, age, salarybycontract):
        super().__init__(name, age)
        self.__salary = salarybycontract

    def calculate_salary(self):
        return self.__salary
def salary(emp):
    print(emp.calculate_salary())
emp1 = FullTimeEmployee("william", 21, 3000000)
emp2 = PartTimeEmployee("johan", 19, 50000, 14)
emp3 = ContractEmployee("dexter", 23, 2000000)
emps = [emp1, emp2, emp3]
for emp in emps:
    salary(emp)