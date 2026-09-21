#include <iostream>
#include <fstream>
using namespace std;
int main()
{
    ofstream myFile("name.txt");
    myFile<<"my name William James Moriarty\n";
    myFile.close();
}