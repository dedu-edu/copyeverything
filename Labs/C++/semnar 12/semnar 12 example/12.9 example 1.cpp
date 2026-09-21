#include <iostream>
using namespace std;
class allSum
{
public:
    int Sum(int a,int b)
    {
        return a+b;
    }
};
class allMulti : public allSum
{
public:
    int Multi(int a,int b)
    {
        return a*b;
    }
};
int main()
{
    allMulti myObj;
    int a,b,sum,multi;
    cin>>a>>b;
    sum = myObj.Sum(a,b);
    multi = myObj.Multi(a,b);
    cout<<"the sum is: " <<sum<<endl;
    cout<<"the multi is: "<<multi<<endl;
}