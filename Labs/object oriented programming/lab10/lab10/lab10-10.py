class Robot:
    __sensor_data = 0
    def __init__(self, name):
        self.name = name

    def perform_task(self):
        pass


class CleaningRobot(Robot):
    def __init__(self, name):
        super().__init__(name)

    def perform_task(self):
        print("Cleaning...")


class DeliveryRobot(Robot):
    def __init__(self, name):
        super().__init__(name)

    def perform_task(self):
        print("Delivering...")

class SecurityRobot(Robot):
    def __init__(self, name):
        super().__init__(name)

    def perform_task(self):
        print("Protecting...")

#--------------------------------
robo1 = CleaningRobot("Robo1")
robo2 = DeliveryRobot("Robo2")
robo3 = SecurityRobot("Robo3")
robots = [robo1, robo2, robo3]
for robot in robots:
    robot.perform_task()

