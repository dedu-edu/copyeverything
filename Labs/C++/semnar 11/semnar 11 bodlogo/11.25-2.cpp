#include <iostream>
using namespace std;
class myClass
{
    public:
    myClass()
    {
        cout<<"Constructor called"<<endl;
    }
};
int main()
{
    myClass obj;
    return 0;
}