class Cake:
    def __init__(self, flavour):
        self.flavour = flavour
    def baking(self,baking_time):
        if baking_time < 60:
            self.cake_type = "light"
        if baking_time >= 60:
            self.cake_type = "dark"
    def finish(self):
        return self.cake_type, self.flavour
cake1 = Cake(input("enter flavour: "))
cake1.baking(int(input("enter baking time: ")))
print(cake1.finish())
