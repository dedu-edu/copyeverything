class Student:
    def __init__(self, name, student_id, gpa):
        self._name = name
        self._student_id = student_id
        self._gpa = gpa

    def is_scholarship(self):
        if self._gpa >= 3.2:
            return True
        else:
            return False

Khosbayar = Student("Khosbayar", 21, 3.2)
print(Khosbayar.is_scholarship())