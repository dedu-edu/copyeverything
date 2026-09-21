class Car:
    def __init__(self, brand, model, year):
        self._brand = brand
        self._model = model
        self._year = year

    def get_info(self):
        print(f"{self._brand} {self._model} {self._year}")

car1 = Car("Toyota", "Prius", "2018")
car2 = Car("Mclaren", "P1", "2013")
car3 = Car("Cadillac", "XT5", "2024")

car1.get_info()
car2.get_info()
car3.get_info()
