class Node(object):
    def __init__(self, data):
        self.data = data
        self.next = None


class LinkedList(object):
    def __init__(self, border):
        self.head = None
        self.border = border
        self.counting = 1


    def append(self, data):
        new_node = Node(data)
        current = self.head

        if current:
            while current.next:
                current = current.next
            current.next = new_node

        else:
            self.head = new_node


    def prepend(self,data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node


    def printlist(self):
        current = self.head
        output = []
        while current:
            output.append(current.data)
            current = current.next
        return output


    def movement(self, directions):
        current = self.head
        new_head = self.moving(directions)
        second = current.next

        if second and new_head == second.data:
            self.write_into_output("Stuck")
            return

        if new_head == "dead":
            self.write_into_output("dead")
            return False

        if self.self_collusion(new_head) is True:
            self.write_into_output("Self Collusion")
            return False

        self.prepend(new_head)
        self.remove_tail()
        self.write_into_output(self.printlist())


    def remove_tail(self):
        current = self.head
        if current is None or current.next is None:
            return

        while current.next.next is not None:
            current = current.next
        current.next = None


    def write_into_output(self, line):
        with open("output.txt", "a") as f:
            f.write(f'After {self.counting}th move: {line} \n')
        self.counting += 1


    def moving(self, directions):
        move_map = {"R": [1, 0], "L": [-1, 0], "U": [0, 1], "D": [0, -1]}
        current = self.head
        temp = current.data[:]
        temp[0] += move_map[directions][0]
        temp[1] += move_map[directions][1]

        if temp[0] > self.border[0] or temp[0] < 0 or temp[1] > self.border[1] or temp[1] < 0:
            return "dead"
        return temp


    def self_collusion(self, new_head):
        checking = self.head.next
        while checking and checking.next:
            if checking.data == new_head:
                return True
            checking = checking.next
        return False

#--------------------------------------------------

borders = [50, 50]
coord = []
direction = []
snake = LinkedList(borders)

with open("output.txt", "w") as g:
    g.write("")

with open("input.txt", "r") as f:
    m,n = list(map(int, f.readline().split()))
    movement = f.read().split()
    i = 0

    while i < m*2+n:
        if i < m*2:
            coord.append(list((int(movement[i]), int(movement[i + 1]))))
            i = i + 2

        else:
            direction.append(movement[i])
            i = i + 1
for i in coord:
    snake.append(i)
with open("output.txt", "w") as f:
    f.write(f"""original body: {snake.printlist()}
-----------------------------------------------
""")

for i in direction:
    x = snake.movement(i)
    if x is False:
        break

