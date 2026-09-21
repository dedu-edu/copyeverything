#include <iostream>
using namespace std;
int main() {
    int a,b,c,median;
    cout << "enter the numbers: ";
    cin >> a >> b >> c;
    median = (a+b+c)/3;
    cout << "median is " << median;
    return 0;
}