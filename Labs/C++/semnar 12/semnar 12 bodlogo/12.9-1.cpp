#include <iostream>
using namespace std;
class Vehicle
{
    public:
    void engine()
    {
        cout <<" engine start" << endl;
    }
};
class Car: public Vehicle
{
    public:
    void brand()
    {
        cout <<"Volvo" << endl;
    }
};
int main()
{
    Car myCar;
    myCar.engine();
    myCar.brand();
    return 0;
}