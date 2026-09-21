#include <iostream>
#include <cmath>
using namespace std;
int main() {
    double a,b,c;
    cout << "enter the value of a and b: ";
    cin >> a >> b;
    c = sqrt(pow(a, 2)+pow(b, 2));
    cout << "the hypothenus is: " << c;
    return 0;
}