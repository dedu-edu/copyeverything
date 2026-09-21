class Order:
    items = []
    menu = {}
    __priority = False
    id = ""
    def __init__(self, id, menu, items, priority=False):
        self.id = id
        self.menu = menu
        self.__priority = priority
        self.items = items

    def get_priority(self):
        return self.__priority

    def total_price(self):
        pass

class DineIn(Order):
    __tip = 0
    def __init__(self, id, menu, items, priority, tip):
        super().__init__(id, menu, items, priority)
        self.__tip = tip

    def total_price(self):
        total = 0
        for item in self.items:
            total += self.menu[item]
        total += self.__tip
        return total

class TakeAway(Order):
    __bag_price = 0
    def __init__(self, id, menu, items, priority, bag_price):
        super().__init__(id, menu, items, priority)
        self.__bag_price = bag_price

    def total_price(self):
        total = 0
        for item in self.items:
            total += self.menu[item]
        total += self.__bag_price
        return total

class Delivery(Order):
    __delivery_fee = 0
    def __init__(self, id, menu, items, priority, delivery_fee):
        super().__init__(id, menu,items,priority)
        self.__delivery_fee = delivery_fee

    def total_price(self):
        total = 0
        for item in self.items:
            total += self.menu[item]
        total += self.__delivery_fee
        return total

def sum_order(orders):
    total = 0
    for order in orders:
        total += order.total_price()
    return total
menu = {"Pasta":1000, "Spagetti":1500, "Pizza":790, "Sushi":200, "Fried Chicken":450, "Cola":100, "Fanta":95, "Ice cream":250}

def get_order():
    items = []
    types = int(input("how many different type of food would you like? "))
    for i in range(types):
        food = input("What type of food would you like? ")
        amount = int(input("How much? "))
        for j in range(amount):
            items.append(food)
    print("""thank u for your order!
    --------------------------------""")
    return items

#------------------------------------------------------------
items1 = get_order()
items2 = get_order()
items3 = get_order()

order1 = DineIn("order1",menu, items1, False, 10)
order2 = TakeAway("order2",menu, items2, False, 15)
order3 = Delivery("order3",menu, items3, True, 20)

orders = [order1, order2, order3]
count = 0
prio_order = []
normal_order = []
for i in orders:
    if i.get_priority():
        prio_order.append(i)
    else:
        normal_order.append(i)
all_orders = prio_order + normal_order
for order in all_orders:
    print(f"Total price of {order.id}: {order.total_price()}")

print(f"Total price of all orders: {sum_order(orders)}")
