class Employee:
    def __init__(self, name, salary):
        self._name = name
        self._salary = salary

    def annual_salary(self):
        print(f'the annual salary is {self._salary}')

    def increase_salary(self, percent):
        self._salary = self._salary + (self._salary/100*percent)
        print("increased!!")

action = True
employee1 = Employee("khosbayar", 1000000)
while action:
    action = input("""What would you like to do? 
    |1 for annual salary| 2 for a raise|   
    """)
    if action == "1":
        employee1.annual_salary()
    elif action == "2":
        percent = int(input("how much percent to increase? "))
        employee1.increase_salary(percent)
    else:
        print("invalid action")
    action = input("Do you want to continue? (Y/N): ")
    if action.lower() == "n":
        action = False
        print("Thank you for using this program")
