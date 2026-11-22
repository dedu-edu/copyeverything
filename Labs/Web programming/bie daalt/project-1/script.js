const counter = document.querySelector('#counter')
const decrease = document.querySelector('#decrease')
const reset = document.querySelector('#reset')
const increase = document.querySelector('#increase')

num = Number(counter.textContent)

function change_counter(num){
    if (num > 0){
        counter.style.color = "green"
    }
    else if (num < 0){
        counter.style.color = "red"
    }
    else {
        counter.style.color = "black"
    }
}

decrease.addEventListener("click", function(){
    counter.textContent = num - 1
    num--
    change_counter(num)
})

increase.addEventListener("click", function(){
    counter.textContent = num + 1
    num++
    change_counter(num)
})

reset.addEventListener("click", function(){
    counter.textContent = 0
    num = 0
    change_counter(num)
})