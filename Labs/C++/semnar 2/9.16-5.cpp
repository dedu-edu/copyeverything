#include <iostream>
using namespace std;
int main() {
    int a,b,c;
    cout << "Enter a number: ";
    cin >> a;
    b = a / 10;
    a = a % 10;
    c = a * b;
    cout << "the multiplication of the digits is: " << c;
    return 0;
}
