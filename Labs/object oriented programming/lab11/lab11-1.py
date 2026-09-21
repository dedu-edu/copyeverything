from datetime import datetime
from abc import ABC, abstractmethod
from enum import Enum
from dataclasses import dataclass

class MenuItem(ABC):
    @abstractmethod
    def calculate_price(self):
        pass

    @abstractmethod
    def display_info(self):
        pass

class Size(Enum):
    SMALL = 1
    MEDIUM = 2
    LARGE = 3

class FoodType(Enum):
    VEGAN = 1
    MEAT = 2
    SEAFOOD = 3

@dataclass
class Order:
    order_id: int
    customer_name: str
    items: list
    created_time: datetime

class Drink(MenuItem):
    def __init__(self, name, price, size):
        self.name = name
        self.price = price
        self.size = size

    def calculate_price(self):
        if self.size == Size.SMALL.value:
            return self.price
        elif self.size == Size.MEDIUM.value:
            return self.price * 1.2
        elif self.size == Size.LARGE.value:
            return self.price * 1.4
        else:
            return "Invalid size"

    def display_info(self):
        return f"Drink: {self.name} | Size: {Size(self.size).name} | Price: {self.calculate_price()}"

class Food(MenuItem):
    def __init__(self, name, price, type, calories):
        self.price = price
        self.name = name
        self.type = type
        self.calories = calories

    def calculate_price(self):
        if self.type == FoodType.MEAT.value:
            return self.price
        elif self.type == FoodType.SEAFOOD.value:
            return self.price * 1.15
        elif self.type == FoodType.VEGAN.value:
            return self.price * 0.9
        else:
            return "Invalid type"

    def display_info(self):
        return f"Food: {self.name} | Type: {FoodType(self.type).name} | Price: {self.calculate_price()} | Calories: {self.calories}"

class Dessert(MenuItem):
    def __init__(self, name, price, is_sugar_free=False):
        self.name = name
        self.price = price
        self.is_sugar_free = is_sugar_free

    def calculate_price(self):
        if self.is_sugar_free:
            return self.price * 1.2
        else:
            return self.price

    def display_info(self):
        return f"Dessert: {self.name} | Price: {self.calculate_price()} | IsSugarFree: {self.is_sugar_free}"

def total_price(order):
    total = 0
    for item in order.items:
        total += item.calculate_price()
    return total

def order_info(order):
    print(f"Total ordered items: {len(order.items)}")
    print("--------------------------------------")
    count = 1
    for item in order.items:
        print(f"{count}. {item.display_info()}")
        count += 1
    print(f"""--------------------------------------
Total price: {total_price(order)}
Total price with VAT: {vat(order)}
Most expensive food: {most_expensive_item(order)[0]} with price of {most_expensive_item(order)[1]}
Avg price: {avg_price(order)}
""")

def most_expensive_item(order):
    max = 0
    max_item = None
    for item in order.items:
        if item.calculate_price() > max:
            max = item.calculate_price()
            max_item = item
    return max_item.name, max_item.calculate_price()

def avg_price(order):
    return round(total_price(order) / len(order.items),1)

def vat(order):
    vat_percentage = 0.1
    return total_price(order) + total_price(order)*vat_percentage

food1 = Food("Steak", 1000, 1, 2300)
food2 = Food("Pizza", 700, 2, 1000)
food3 = Food("Pasta", 800, 3, 500)

drink1 = Drink("Cola", 100, 1)
drink2 = Drink("Fanta", 100, 2)
drink3 = Drink("Sprite", 100, 3)

dessert1 = Dessert("ice cream", 300, True)
dessert2 = Dessert("gelato", 250)
dessert3 = Dessert("sorbet", 300)

order1 = Order(1, "Hosoo", [food1, drink1, dessert1], datetime.today())
order2 = Order(2, "Amina", [food2, drink3, dessert2], datetime.today())

order_info(order1)
order_info(order2)