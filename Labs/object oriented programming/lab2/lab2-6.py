class Book:
    def __init__(self, title, author, pages):
        self._title = title
        self._author = author
        self._pages = pages

    def is_long_book(self):
        if self._pages > 300:
            return True
        else:
            return False

book1 = Book("ABC", "John", 400)
print(book1.is_long_book())