class Computer:
    cpu = ""
    ram = ""
    def __init__(self,cpu,ram):
        self.cpu = cpu
        self.ram = ram

    def specs(self):
        return f"CPU: {self.cpu}, RAM: {self.ram}"

class Laptop(Computer):
    battery = ""
    def __init__(self,cpu,ram,battery):
        self.battery = battery
        Computer.__init__(self,cpu,ram)

    def specs(self):
        return f"{Computer.specs(self)}, battery: {self.battery}"

laptop1 = Laptop("I5-13000","16gb","10000mAh")
print(laptop1.specs())