class BankAccount:
    owner = ""
    balance = 0
    def __init__(self,owner,balance):
        self.owner = owner
        self.balance = balance

    def deposit(self,amount):
        self.balance += amount
        return self.balance

class SavingsAccount(BankAccount):
    interest_rate = 0
    def __init__(self,owner,balance,interest_rate):
        self.interest_rate = interest_rate
        BankAccount.__init__(self,owner,balance)

    def add_interest(self,amount):
        self.interest_rate += amount
        return self.interest_rate

acc1 = SavingsAccount("John",500,10)
acc1.add_interest(100)
acc1.deposit(200)