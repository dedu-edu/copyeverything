class Employee:
    name = ""
    age = 0
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def calc_salary(self):
        return 0

class FullTimeEmployee(Employee):
    bonus_percent = 0
    hours_per_month = 0
    def __init__(self, name, age, hours, bonus):
        super().__init__(name, age)
        self.hours_per_month = hours
        self.bonus_percent = bonus

    def calc_salary(self):
        return round(self.hours_per_month * 50000 + (self.bonus_percent * self.hours_per_month / 100))


class PartTimeEmployee(Employee):
    hours_per_month = 0
    def __init__(self, name, age, hours):
        super().__init__(name, age)
        self.hours_per_month = hours

    def calc_salary(self):
        return self.hours_per_month * 50000

class Intern(Employee):
    scholarship = 0
    def __init__(self, name, age, scholarship):
        super().__init__(name, age)
        self.scholarship = scholarship

    def calc_salary(self):
        return self.scholarship

fullemp = FullTimeEmployee("john", 30, 240, 15)
partemp = PartTimeEmployee("Tom", 22, 150)
intern1 = Intern("william", 18, 400000)
print(fullemp.calc_salary())
print(partemp.calc_salary())
print(intern1.calc_salary())