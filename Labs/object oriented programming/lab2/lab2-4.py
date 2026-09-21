class BankAccount:
    def __init__(self, owner, balance):
        self._balance = balance
        self._owner = owner

    def withdraw(self, amount):
        if amount > self._balance:
            return False
        else:
            self._balance -= amount
            print("Successfully withdrawn")
            return True
    def deposit(self, amount):
        self._balance += amount
        print("Successfully deposited")
    def display_balance(self):
        print(f"Current balance[{self._balance}$]")

action = True
account = BankAccount("Khosoo", float(100))
while action:
    action = input("""What would you like to do? 
    |1 for withdraw| 2 for deposit| 3 for display balance|   
    """)
    if action == "1" :
        amount = float(input("Enter the amount to withdraw: "))
        output = account.withdraw(amount)
        if not output:
            print("Insufficient funds")
    elif action == "2":
        amount = float(input("Enter the amount to deposit: "))
        account.deposit(amount)

    elif action == "3":
        account.display_balance()

    else:
        print("Invalid input")
    action = input("Do you want to continue? (Y/N): ")
    if action.lower() == "n":
        action = False
        print("Thank you for using this program")
