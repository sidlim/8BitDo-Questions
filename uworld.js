// Setup our references to the page elements:
let answerBox = document.querySelectorAll('#answerContainer')[0];
let answerChoices = answerBox.children[0].children;
let nextButton = document.querySelectorAll('a[aria-label="Navigate to Next Question"]')[0];
let prevButton = document.querySelectorAll('a[aria-label="Navigate to Previous Question"]')[0];

// Code for dealing with answers:
function deselectAnswer(answerChoiceRoot) {
    let inputElement = answerChoiceRoot.children[0].children[1].children[0].children[0].children[0].children[0].children[2];
    let displayButton = answerChoiceRoot.children[0].children[1].children[0].children[0];
    inputElement.checked = false;
    inputElement.dispatchEvent(new Event('change', {bubbles: true}))
    displayButton.classList.remove("mat-radio-checked");
}

function selectAnswer(answerChoiceRoot) {
    let inputElement = answerChoiceRoot.children[0].children[1].children[0].children[0].children[0].children[0].children[2];
    let displayButton = answerChoiceRoot.children[0].children[1].children[0].children[0];
    inputElement.checked = true;
    inputElement.dispatchEvent(new Event('change', {bubbles: true}))
    displayButton.classList.add("mat-radio-checked");
}

function dispatchAnswerStrikethrough(answerChoiceRoot) {
    answerChoiceRoot.childNodes[0].childNodes[1].childNodes[0].dispatchEvent(new Event('click', {'bubbles': true}))
}

function focusAnswer(answerChoiceRoot) {
    answerChoiceRoot.childNodes[0].style.background = 'var(--color-background-transparent-hover)';
}

function defocusAnswer(answerChoiceRoot) {
    answerChoiceRoot.childNodes[0].style.background = '';
}

// Code for packaging up answer controls into a nice format that our script can nicely interact with:
function makeAnswerNode(answerChoiceRoot) {
    let answerNode = {};
    answerNode.focus = () => {focusAnswer(answerChoiceRoot)}
    answerNode.defocus = () => {defocusAnswer(answerChoiceRoot)}
    answerNode.interact = (action) => {
        // Pass in a custom event that corresponds to key interaction, then switch cases so we can either select or rule out
        switch (action) {
            case 'ruleout':
                dispatchAnswerStrikethrough(answerChoiceRoot);
                return;
            case 'pick':
                dispatchAnswerClick(answerChoiceRoot);
                return;
            default:
                return;
        }
    }
    return(answerNode);
}

// Instantiate our controller:
let answerList = Array.prototype.map.call(answerChoices, makeAnswerNode);
let activeIndex = 0;
answerList[activeIndex].focus();

function initializeController() {
    answerList = Array.prototype.map.call(answerChoices, makeAnswerNode);
    activeIndex = 0;
    answerList[activeIndex].focus();
    console.log('reinitialized');
};

// Clamping the focused element and handling next/previous answer choice logic:
function nextChoice() {
    if (activeIndex < answerList.length - 1) {
        answerList[activeIndex].defocus();
        activeIndex = activeIndex + 1;
        answerList[activeIndex].focus();
    }
}

function prevChoice() {
    if (activeIndex > 0) {
        answerList[activeIndex].defocus();
        activeIndex = activeIndex - 1;
        answerList[activeIndex].focus();
    }
}

// Handle next/previous question logic:
function nextQuestion() {
    nextButton.dispatchEvent(new Event('click', {'bubbles': true}))
}

function prevQuestion() {
    prevButton.dispatchEvent(new Event('click', {'bubbles': true}))
}

// Key Listener:
let delay = 0;
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case "Enter":
            e.preventDefault();
            answerList[activeIndex].interact('pick');
            break;
        case "Backspace":
            e.preventDefault();
            answerList[activeIndex].interact('ruleout');
            break;
        case "ArrowUp":
            e.preventDefault();
            prevChoice();
            break;
        case "ArrowDown":
            e.preventDefault();
            nextChoice();
            break;
        case "ArrowRight":
            e.preventDefault();
            setTimeout(initializeController, delay);
            break;
        case "ArrowLeft":
            e.preventDefault();
            setTimeout(initializeController, delay);
            break;
        default:
            break;
    }
})