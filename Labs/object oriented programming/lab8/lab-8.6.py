class Instrument:
    name = ""
    owner = ""
    def __init__(self, name, owner):
        self.name = name
        self.owner = owner

    def play_instrument(self):
        print("Moving " + self.name)

class Piano(Instrument):
    def __init__(self, name, owner):
        super().__init__(name, owner)

    def play_instrument(self):
        print("pressing notes")

class Guitar(Instrument):
    def __init__(self, name, owner):
        super().__init__(name, owner)

    def play_instrument(self):
        print("riffing the strings")

class Drum(Instrument):
    def __init__(self, name, owner):
        super().__init__(name, owner)

    def play_instrument(self):
        print("hitting the drums")

class Violin(Instrument):
    def __init__(self, name, owner):
        super().__init__(name, owner)

    def play_instrument(self):
        print("bowing the strings")

def play_instrument(Instrument):
    Instrument.play_instrument()

inst1 = Piano("Piano", "Will")
inst2 = Guitar("Guitar", "Will")
inst3 = Violin("Violin", "Will")
inst4 = Drum("Drum", "Will")
inst_list = [inst1, inst2, inst3, inst4]

for inst in inst_list:
    inst.play_instrument()