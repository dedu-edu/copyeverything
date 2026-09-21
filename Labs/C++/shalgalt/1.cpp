#include <iostream>
using namespace std;
int square(int a, int b)
{
    return a + b;
}
int main()
{
    int a,b,s;
    cin >> a >> b;
    s = square(a,b);
    cout<< "square is " << s*2;
}