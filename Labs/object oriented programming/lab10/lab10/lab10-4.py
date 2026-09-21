class Course:
    title = ""
    __progress = 0
    def __init__(self, title,progress):
        self.title = title
        self.__progress = progress
    @property
    def progress(self):
        return self.__progress

    def set_progress(self, progress):
        self.__progress = progress
        return

class VideoCourse(Course):
    def __init__(self, title,progress):
        super().__init__(title,progress)

    def get_progress(self):
        print(f'Total watched progress:{self.progress} %')
        return self.progress

class LiveCourse(Course):
    def __init__(self, title,progress):
        super().__init__(title,progress)

    def get_progress(self):
        print(f'Total participated progress:{self.progress} %')
        return self.progress

class HybridCourse(Course):
    def __init__(self, title,progress):
        super().__init__(title,progress)

    def get_progress(self):
        print(f'Total hybrid progress:{self.progress} %')
        return self.progress

def sum_progression(courses):
    total = 0
    for course in courses:
        total += course.get_progress()
    return round((total*100)/(len(courses)*100),2)
c1 = VideoCourse("Video Course",10)
c2 = LiveCourse("Live Course",17)
c3 = HybridCourse("Hybrid Course",25)
student1 = [c1,c2,c3]
a1 = VideoCourse("Video Course",50)
a2 = LiveCourse("Live Course",5)
a3 = HybridCourse("Hybrid Course",75)
student2 = [a1,a2,a3]
info1 = sum_progression(student1)

print(f"""Student1:
Overall progress: {info1}
--------------------------""")

info2 = sum_progression(student2)

print(f"""Student2:
Overall progress: {info2}
--------------------------""")