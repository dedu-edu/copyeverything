class CartItem():
    _name = ""
    _price = 0
    _quantity = 0
    def __init__(self, name, price, quantity):
        self._name = name
        self._quantity = quantity
        self._price = price

    def total_price(self):
        return self._price * self._quantity

item1 = CartItem("milk", 100, 2)
print(f"total price of {item1._name} is {item1.total_price()}")