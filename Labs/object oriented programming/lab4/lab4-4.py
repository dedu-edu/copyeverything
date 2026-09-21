class User:
    __password = ""
    name = ""
    def __init__(self, name, password):
        self.name = name
        self.__password = password

    def check_password(self, password):
        if self.__password == password:
            return True
        else:
            return False

user1 = User("John", "1234")
print(user1.check_password("234"))
print(user1.check_password("1234"))