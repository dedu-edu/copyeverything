class Person:
    def __init__(self, name, age):
        self._name = name
        self._age = age

    def introduce(self):
        print(f"Сайн байна уу, намайг {self._name} гэдэг. Би {self._age} настай.")
        return

Hosbayar = Person("Hosbayar", 18)
Hosbayar.introduce()

Amina = Person("Amina", 19)
Amina.introduce()