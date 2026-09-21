#include <iostream>
#include <fstream>
using namespace std;
int main()
{
    try
    {
        int age;
        cin>>age;
        if (age>=18)
        {
            cout<<"ta songuul ugch bolno";
        }
        else
        {
            throw 69;
        }
    }
    catch(int myNum)
    {
        cout<<"Nas hurehgui bn. Songuul ugch bolohgui.\n";
        cout<<"Error code: "<<myNum;
    }
    return 0;
}