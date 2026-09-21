#include <iostream>
using namespace std;
class myClass
{
    public:
    int x;
    private:
    int y;
};
int main()
{
    myClass obj;
    cin>>obj.x>>obj.y;
    cout << obj.x << endl;
    cout << obj.y << endl;
    return 0;
}