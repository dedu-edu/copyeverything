class Teacher:
    name = ''
    subject = ''
    def __init__(self, name, subject):
        self.name = name
        self.subject = subject

class OnlineTeacher(Teacher):
    __platform = ''
    def __init__(self, name, subject, platform):
        super().__init__(name, subject)
        self.__platform = platform

    def current_platform(self):
        return self.__platform


teacher1 = OnlineTeacher("Tuvshtugs", "Object oriented programming", "Zoom")
print(teacher1.current_platform())
print(teacher1.name)
print(teacher1.subject)