class Node(object):
    def __init__(self, data):
        self.data = data
        self.next = None
        self.prev = None

class DoubleLinkedList(object):
    def __init__(self):
        self.head = None
        self.tail = None

    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            self.tail = new_node
        else:
            self.tail.next = new_node
            new_node.prev = self.tail
            self.tail = new_node

    def delete(self,data):
        current = self.head
        while current.next.data != data:
            current = current.next
        current.next = current.next.next
        current.next.prev = current
    def printDLL(self):
        current = self.head
        print(current.data, end='->')
        current = current.next
        while current.next:
            print(f'<-{current.data}', end='->')
            current = current.next
        print(f'<-{current.data}')
List1 = DoubleLinkedList()
List1.append("A")
List1.append("B")
List1.append("C")
List1.append("D")
List1.delete("C")
List1.printDLL()
