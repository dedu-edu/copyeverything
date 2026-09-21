class Phone:
    brand = ""
    def __init__(self, brand):
        self.brand = brand

    def call(self):
        return "Calling..."

class SmartPhone(Phone):
    os = ""
    def __init__(self, brand, os):
        super().__init__(brand)
        self.os = os

    def install_app(self):
        return "Installing..."

phone1 = SmartPhone("Apple", "Ios 17.9")
print(phone1.call())
print(phone1.os)
print(phone1.install_app())