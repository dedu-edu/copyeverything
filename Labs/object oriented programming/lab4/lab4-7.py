class Student:
    __gpa = 0.0
    _name = ""
    def __init__(self,name,gpa):
        self._name = name
        self.__gpa = gpa

    def get_gpa(self):
        return self.__gpa

    def set_gpa(self,gpa):
        gpa = float(gpa)
        if 0.0<=gpa<=4.0:
            self.__gpa = gpa
            return self.get_gpa()
        else:
            raise ValueError("Gpa must be between 0 and 4")

student1 = Student("Hosoo",3.0)
print(f"current gpa is {student1.get_gpa()}")
print(f"current gpa is {student1.set_gpa(4)}")
print(f"current gpa is {student1.set_gpa(5)}")