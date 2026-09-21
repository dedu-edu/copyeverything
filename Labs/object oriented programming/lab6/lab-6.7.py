class Book:
    title = ""
    author = ""
    def __init__(self,title,author):
        self.title = title
        self.author = author

    def info(self):
        return f"{self.title} by {self.author}"

class EBook(Book):
    file_size = 0
    def __init__(self,title,author,file_size):
        self.file_size = file_size
        Book.__init__(self,title,author)

    def info(self):
        return f"{Book.info(self)}, file size:{self.file_size}mb"

book1 = EBook("War and Peace","Lev Tolstoi", 100)
print(book1.info())