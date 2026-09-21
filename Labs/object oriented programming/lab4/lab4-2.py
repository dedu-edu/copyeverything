class Student:
    __gpa = 0.0
    _name = ""
    def __init__(self,name,gpa):
        self._name = name
        self.__gpa = gpa

    def get_gpa(self):
        return self.__gpa

student1 = Student("Hosoo",3.0)
print(student1.get_gpa())
print(student1.__gpa())
