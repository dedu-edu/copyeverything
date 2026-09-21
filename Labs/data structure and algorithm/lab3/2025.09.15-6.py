class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


class LinkedList:
    def __init__(self):
        self.head = None

    def Prependd(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node

    def Insertt(self,data,index):
        if index == 0:
            llist.Prependd(data)
        new_node = Node(data)
        current_node = self.head
        index_to_search = index
        current_index = 0
        while current_node:
            if current_index == index_to_search:
                break
            current_node = current_node.next
            current_index += 1
        if current_node is None:
            return
        new_node.next = current_node.next
        current_node.next = new_node

    def Appendd(self, data):
        new_node = Node(data)
        if self.head == None:
            self.head = new_node
            return
        current_node = self.head
        while current_node.next:
            current_node = current_node.next
        current_node.next = new_node

    def printLL(self):
        current_node = self.head
        while current_node:
            print(current_node.data)
            current_node = current_node.next

    def GetLength(self):
        current_node = self.head
        length = 0
        while current_node:
            length += 1
            current_node = current_node.next
        return length

    def GetIndexValue(self, index):
        current_node = self.head
        index_to_search = index
        current_index = 0
        while current_node:
            if current_index == index_to_search:
                return current_node.data
            current_node = current_node.next
            current_index += 1


n = int(input("enter linked list size: "))
llist = LinkedList()
for i in range(n):
    llist.Appendd(int(input(f"enter node{i + 1}'s data: ")))
llist.printLL()
insert_index = int(input("enter insert index: "))
insert_node_value = int(input("enter insert node value: "))
llist.Insertt(insert_node_value, insert_index)
llist.printLL()