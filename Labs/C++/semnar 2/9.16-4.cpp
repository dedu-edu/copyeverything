#include <iostream>
using namespace std;
int main() {
    int a;
    cout << "Enter a number: ";
    cin >> a;
    a = a % 100;
    a = a / 10;
    cout << "second to last digit is: " << a;
    return 0;
}
