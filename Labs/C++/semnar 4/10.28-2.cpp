#include <iostream>
#include <string>
using namespace std;
enum Season {
    spring = 0,
    summer = 4,
    autumm = 8,
    winter = 12
};
int main() {
    enum Season season = spring;
    cout << season << endl;
    enum Season season2 = summer;
    cout << season2 << endl;
    enum Season season3 = autumm;
    cout << season3 << endl;
    enum Season season4 = winter;
    cout << season4 << endl;
    return 0;
}