class Printer:
    name = ""
    def __init__(self, name):
        self.name = name

    def print_data(self):
        print("printing data")

class TextPrinter(Printer):
    def __init__(self, name):
        super().__init__(name)

    def print_data(self):
        print("Printing Text")

class ImagePrinter(Printer):
    def __init__(self, name):
        super().__init__(name)

    def print_data(self):
        print("Printing Image")

class PDFPrinter(Printer):
    def __init__(self, name):
        super().__init__(name)

    def print_data(self):
        print("Printing PDF")

def print_data(Printer):
    Printer.print_data()

pr1 = TextPrinter("Printer1")
pr2 = ImagePrinter("Printer2")
pr3 = PDFPrinter("Printer3")
printers = [pr1, pr2, pr3]
for printer in printers:
    print_data(printer)