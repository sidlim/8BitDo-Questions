// Setup our references to the page elements:
let questionBox = document.querySelectorAll('div[class=""]')[1];
let promptBox = document.querySelectorAll('div[class=""]')[2];
let answerBox = document.querySelectorAll('div[class=""]')[3];
let answerChoices = answerBox.childNodes;
let nextButton = document.querySelectorAll('button[data-e2e-test-id="next-button"]')[0];
let prevButton = document.querySelectorAll('button[data-e2e-test-id="prev-button"]')[0];

// Code for dealing with answers:
function dispatchAnswerClick(answerChoiceRoot) {
    answerChoiceRoot.childNodes[0].childNodes[0].dispatchEvent(new Event('click', {'bubbles': true}))
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

let delay = 0;

// Do our key mapping:
/*let actionMap = {
    'Select Answer': () => {answerList[activeIndex].interact('pick');},
    'Strikethrough Answer': () => {answerList[activeIndex].interact('ruleout');},
    'Previous Answer': () => {prevChoice();},
    'Next Answer': () => {nextChoice();},
    'Previous Question': () => {
        prevQuestion();
        setTimeout(initializeController, delay);
    },
    'Next Question': () => {
        nextQuestion();
        setTimeout(initializeController, delay);
    }
}
let prompts = Object.keys(actionMap);
createKeyMapping(prompts, console.log).then((keyMap) => {
    console.log(keyMap)
    document.addEventListener('keydown', (e) => {
        if (keyMap.has(e.key)) {
            e.stopImmediatePropagation();
            e.preventDefault();
            let action = keyMap.get(e.key);
            actionMap[action]();
        }
    }, true)
});
*/
// Old Key Listener - deprecated because it doesn't play well with the keymapper
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