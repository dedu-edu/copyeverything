class Protocol:
    def __init__(self, name):
        self.name = name
        self.__packet = {}

    def send_data(self, data):
        pass

    def get_packet(self):
        return self.__packet


class HTTP(Protocol):
    def __init__(self, name):
        super().__init__(name)

    def send_data(self, data):
        self.get_packet()["HTTP"] = f"TEXT >> {data}"


class FTP(Protocol):
    def __init__(self, name):
        super().__init__(name)

    def send_data(self, data):
        self.get_packet()["FTP"] = f"FILE >> {data}"


class TCP(Protocol):
    def __init__(self, name):
        super().__init__(name)

    def send_data(self, data):
        self.get_packet()["TCP"] = f"PACKET >> {data}"


# ─── Test ─────────────────────────────────────────────────
prot1 = HTTP("prot1")
prot2 = FTP("prot2")
prot3 = TCP("prot3")

my_data = "Hello, Network!"

prot1.send_data(my_data)
prot2.send_data(my_data)
prot3.send_data(my_data)

print(prot1.get_packet())
print(prot2.get_packet())
print(prot3.get_packet())