#include <iostream>
using namespace std;
class Sum
{
public:
    int sum=0;
    Sum(int b,int a)
    {
        sum = a + b;
    }
};
int main()
{
    int num1,num2;
    cin>>num1>>num2;
    Sum sumobj1(num1,num2);
    cout << sumobj1.sum << endl;
    return 0;
}