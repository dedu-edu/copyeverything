class BankAccount:
    __balance = 0
    _owner = ''
    def __init__(self, owner, balance):
        self.__balance = balance
        self._owner = owner

    def deposit(self, amount):
        self.__balance += amount

    def get_balance(self):
        return self.__balance

    def withdraw(self, amount):
        if amount > self.__balance:
            return False
        else:
            self.__balance -= amount
            return True
user1 = BankAccount("Hosoo", 100)
print(user1.get_balance())
user1.deposit(100)
print(user1.get_balance())
if user1.withdraw(300):
    print(f"Successfully withdrawn! current balance:{user1.get_balance()}")
else:
    print(f"Failed to withdraw! current balance:{user1.get_balance()}")