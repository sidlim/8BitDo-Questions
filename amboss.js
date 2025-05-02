// Setup our references to the page elements:
let questionBox = document.querySelectorAll('div[class=""]')[1];
let promptBox = document.querySelectorAll('div[class=""]')[2];
let answerBox = document.querySelectorAll('div[class=""]')[3];
let answerChoices = answerBox.childNodes;
let nextButton = document.querySelectorAll('button[data-e2e-test-id="next-button"]')[0];
let prevButton = document.querySelectorAll('button[data-e2e-test-id="prev-button"]')[0];



// Code for dealing with answers:
// Send a click to confirm an answer
function dispatchAnswerClick(answerChoiceRoot) {
    answerChoiceRoot.childNodes[0].childNodes[0].dispatchEvent(new Event('click', {'bubbles': true}))
}

// Send a click to strikethrough an answer
function dispatchAnswerStrikethrough(answerChoiceRoot) {
    answerChoiceRoot.childNodes[0].childNodes[1].childNodes[0].dispatchEvent(new Event('click', {'bubbles': true}))
}

// Update the background color of the answer to show it's selected
function focusAnswer(answerChoiceRoot) {
    answerChoiceRoot.childNodes[0].style.background = 'var(--color-background-transparent-hover)';
}

// Update the background color of the answer to show it's been unselected
function defocusAnswer(answerChoiceRoot) {
    answerChoiceRoot.childNodes[0].style.background = '';
}

// Code for packaging up each answer's controls into a nice format that our script can nicely interact with:
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

// extend the prior function to deal with arrays of answers:
function makeAnswerList(answerChoiceArray) {
    Array.prototype.map.call(answerChoiceArray, makeAnswerNode);
}

// Instantiate our controller:
let answerList = makeAnswerList(answerChoices);
let activeIndex = 0;
answerList[activeIndex].focus();

// When the question changes, the answerBox and promptBox nodes get thrown out
// So we need a way to update the references to the new active answerBox and promptBox.
// Then we can run our focus code again and we're good for user interaction.
function updateController() {
    console.log(promptBox, answerBox)
    promptBox = document.querySelectorAll('div[class=""]')[2];
    answerBox = document.querySelectorAll('div[class=""]')[3];
    answerChoices = answerBox.childNodes;
    answerList = Array.prototype.map.call(answerChoices, makeAnswerNode);
    activeIndex = 0;
    answerList[activeIndex].focus();
    console.log('initializeController');
};

// Clamping the focused element and handling next/previous answer choice logic:
function nextChoice() {
    // sometimes the question takes some time to load and updateController (which was called by the kepress handler) fails
    // this is because the answer DOM elements are removed immediately, but the application takes some time to populate
    // them back. the delay between removal and repopulation is annoying to deal with, so I'm going to just 
    if (!answerBox) {
        updateController();
    }
    else if (activeIndex < answerList.length - 1) {
        answerList[activeIndex].defocus();
        activeIndex = activeIndex + 1;
        answerList[activeIndex].focus();
    }
}

function prevChoice() {
    if (!answerBox) {
        updateController();
    }
    else if (activeIndex > 0) {
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

// Detach document onkeydown handler:
let keyDownHandler = document.onkeydown;
document.onkeydown = null;

// Do our key mapping:
let actionMap = {
    'Select Answer': () => {answerList[activeIndex].interact('pick');},
    'Strikethrough Answer': () => {answerList[activeIndex].interact('ruleout');},
    'Previous Answer': () => {prevChoice();},
    'Next Answer': () => {nextChoice();},
    'Previous Question': () => {
        prevQuestion();
        setTimeout(updateController, delay);
    },
    'Next Question': () => {
        nextQuestion();
        setTimeout(updateController, delay);
    }
}
let prompts = Object.keys(actionMap);
createKeyMapping(prompts, alert).then((keyMap) => {
    console.log(keyMap)
    document.addEventListener('keydown', (e) => {
        if (keyMap.has(e.key)) {
            e.stopImmediatePropagation();
            //e.preventDefault();
            let action = keyMap.get(e.key);
            actionMap[action]();
        }
    }, true)
});
