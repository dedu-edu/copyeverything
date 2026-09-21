class Temperature:
    def __init__(self,celsius):
        self._celsius = celsius

    def to_fahrenheit(self):
        farenheit = self._celsius * 1.8 + 32
        print(f'{self._celsius} celsius = {farenheit} fahrenheit')
    def to_kelvin(self):
        kelvin = self._celsius + 273
        print(f'{self._celsius} celsius = {kelvin} kelvin')

temperture_now = Temperature(32)
temperture_now.to_kelvin()
temperture_now.to_fahrenheit()
