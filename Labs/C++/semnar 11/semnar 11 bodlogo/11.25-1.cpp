#include <iostream>
#include <string>
using namespace std;
class myClass{
    public:
    void name(){
        cout << "hello world";
    }
};
int main()
{
    myClass Myobj;
    Myobj.name();
    return 0;
}