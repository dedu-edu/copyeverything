class User:
    __email = ""
    _name = ""
    def __init__(self, name, email):
        self._name = name
        self.__email = email

    @property
    def email(self):
        return self.__email

    @email.setter
    def email(self, email):
        if "@" in email:
            self.__email = email
        else:
            raise ValueError("Invalid email")

user1 = User("John", "typical@gmail.com")
print(user1.email)
user1.email = "work@gmail.com"
print(user1.email)
user1.email = "wronggmail.com"
print(user1.email)