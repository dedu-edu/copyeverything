const prompt = require('prompt-sync')()
var digit = 0
var givenNum = prompt("Дурын тоо оруулна уу: ")
givenNum = Math.abs(givenNum)
while (givenNum != 0){
    givenNum = Math.floor(givenNum / 10)
    digit += 1 
}
if (digit == 0){
    console.log("Нийт орны тоо: 1")
} else {
    console.log(`Нийт орны тоо: ${digit}`)
}