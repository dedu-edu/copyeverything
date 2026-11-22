const userProfile = document.querySelector('#image')
const name = document.querySelector('#name')
const job = document.querySelector('#job')
const review = document.querySelector('#review')
const previous = document.querySelector('#previous')
const next = document.querySelector('#next')
const random = document.querySelector('#random')

const reviews = [
    {
        name: "John",
        job: "Student",
        review: "This website is very helpful and easy to use!",
        image: "./demopfp1.jpeg"
    },

    {
        name: "Mary",
        job: "Web Developer",
        review: "I really enjoyed learning and improving my coding skills!",
        image: "./demopfp2.jpeg"
    },

    {
        name: "David",
        job: "Designer",
        review: "The experience was amazing. I highly recommend it!",
        image: "./demopfp3.jpeg"
    },

    {
        name: "Sarah",
        job: "Teacher",
        review: "A great website for beginners who want to learn coding!",
        image: "./demopfp4.jpeg"
    }
]

let currentItem = 0

function showReview() {
    name.textContent = reviews[currentItem].name
    job.textContent = reviews[currentItem].job
    review.textContent = reviews[currentItem].review
    userProfile.src = reviews[currentItem].image
}

previous.addEventListener("click", function() {
    currentItem--
    if (currentItem < 0) {
        currentItem = reviews.length - 1
    }
    showReview()
})

next.addEventListener("click", function() {
    currentItem++
    if (currentItem > reviews.length - 1) {
        currentItem = 0
    }
    showReview()
})

random.addEventListener("click", function() {
    currentItem = Math.floor(Math.random() * reviews.length)
    showReview()
})

showReview()
