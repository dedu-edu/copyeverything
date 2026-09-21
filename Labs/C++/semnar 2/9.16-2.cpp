#include <iostream>
using namespace std;
int main() {
    int x, y;
    cout << "please enter x value: ";
    cin >> x;
    y = (x * x) * 4 - 3 * x + 5;
    cout << "y = " << y;
    return 0;
}