class LibraryBook():
    _title = ""
    _author = ""
    _available = True
    def __init__(self,title,author,available):
        self._title = title
        self._author = author
        self._available = available
        return
    def borrow(self):
        if self._available:
            self._available = False
            return "Borrowed successfully"
        else:
            return "Unavailable to borrow"
    def return_book(self):
        if not self._available:
            self._available = True
            return "Returned successfully"
        else:
            return "Book has already returned"

    def status(self):
        if self._available:
            return "Book is available"
        elif not self._available:
            return "Book is borrowed"

book1 = LibraryBook("War and Peace", "Lev Tolstoi", True)
print(book1.status())
print(book1.borrow())
print(book1.status())
print(book1.return_book())
print(book1.status())