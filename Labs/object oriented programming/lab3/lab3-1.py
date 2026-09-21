class StudentAverage():
    _name = ""
    _scores = []
    def __init__(self, name, scores):
        self._name = name
        self._scores = scores

    def add_score(self):
        score_to_add = int(input("Enter score to add: "))
        self._scores.append(score_to_add)
        return

    def average(self):
        avg = sum(self._scores) / len(self._scores)
        return avg

    def is_passed(self):
        if self.average() >= 60:
            return True
        else:
            return False

student1 = StudentAverage("hosbayar", [90,100,60])
student1.add_score()
print(f"{student1._name}'s average is: {student1.average()}")
print(f"{student1._name} have passed: {student1.is_passed()}")