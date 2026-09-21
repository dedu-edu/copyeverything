#include <iostream>
using namespace std;
class Area
{
public:
    int square;
    Area(int a,int b)
    {
        square=a*b;
    }
};
int main()
{
    int a,b;
    cin>>a>>b;
    Area areaobj1(a,b);
    cout<<areaobj1.square<<endl;
    return 0;
}