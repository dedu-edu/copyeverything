#include <iostream>
using namespace std;
class square
{
public:
    int a,b;
    square(int a,int b)
    {
        cout << "square is " << a*b << endl;
    }
};
int main()
{
    int a,b;
    cin>>a>>b;
    square shape1(a,b);
}