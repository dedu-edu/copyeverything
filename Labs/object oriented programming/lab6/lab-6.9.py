class Athlete:
    name = ""
    sport = ""
    def __init__(self, name, sport):
        self.name = name
        self.sport = sport

    def info(self):
        return f"name:{self.name}, sport:{self.sport}"

class FootballPlayer(Athlete):
    position = ""
    def __init__(self, name, sport, position):
        self.position = position
        Athlete.__init__(self, name, sport)

    def info(self):
        return f"{Athlete.info(self)}, position:{self.position}"

player1 = FootballPlayer("Messi", "Football", "goalkeeper")
print(player1.info())
