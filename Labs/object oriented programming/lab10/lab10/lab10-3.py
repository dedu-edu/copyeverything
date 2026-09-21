class Device:
    name = ""
    __status = None
    def __init__(self, name):
        self.name = name

    def turn_on(self):
        self.__status = True
        return

    def turn_off(self):
        self.__status = False
        return

class Light(Device):
    def __init__(self, name):
        super().__init__(name)

    def turn_on(self):
        self.__status = True
        return "Turning on lights"

    def turn_off(self):
        self.__status = False
        return "Turning off lights"

class Thermostat(Device):
    temperature = 0
    def __init__(self, name,temperature):
        super().__init__(name)
        self.temperature = temperature

    def turn_on(self):
        self.__status = True
        self.temperature = int(input("Enter temperature: "))
        return f"Set to {self.temperature} degrees c"

    def turn_off(self):
        self.__status = False
        return "Turning off thermostat"

class Camera(Device):
    def __init__(self, name):
        super().__init__(name)

    def turn_on(self):
        self.__status = True
        return "Turning on camera"

    def turn_off(self):
        self.__status = False
        return "Turning off camera"

light1 = Light("Light 1")
light2 = Light("Light 2")
Thermostat1 = Thermostat("Thermostat1",24)
Thermostat2 = Thermostat("Thermostat2",24)
camera1 = Camera("Camera1")
camera2 = Camera("Camera2")
device_list = [light1, light2, Thermostat1, Thermostat2, camera1, camera2]
for device in device_list:
    print(device.name)
    print(device.turn_on())
    print(device.turn_off())
    print("----------------")

