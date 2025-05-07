// ==UserScript==
// @name        AmKey
// @namespace   AmKey
// @version     1.0.1
// @description Remap keys (from 8BitDo or other Anki Controllers) to interact with Amboss Sessions
// @match       *://*.amboss.com/*
// @grant       none
// @run-at      document-idle;
// ==/UserScript==

let AmKey = (function() {
    // Setup our references to the page elements:
    let questionBox = document.querySelectorAll('div[class=""]')[1];
    let promptBox = document.querySelectorAll('div[class=""]')[2];
    let answerBox = document.querySelectorAll('div[data-e2e-test-id|="answer-theme"]')[0].parentElement;
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
        return(Array.prototype.map.call(answerChoiceArray, makeAnswerNode))
    }

    // When the question changes, the answerBox and promptBox nodes get thrown out
    // So we need a way to update the references to the new active answerBox and promptBox.
    // Then we can run our focus code again and we're good for user interaction.
    function updateController() {
        promptBox = document.querySelectorAll('div[class=""]')[2];
        answerBox = document.querySelectorAll('div[data-e2e-test-id|="answer-theme"]')[0].parentElement;
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

    // keyMapping Utilites:
    function getKeyDown() {
        // Prepare for asynchronous output:
        return new Promise((resolve) => {
            // Listen for a keydown and send the key code to our keymapper
            document.addEventListener('keydown', (e) => {
                e.stopImmediatePropagation();
                e.preventDefault();
                resolve(e.key)
            }, {once: true})
        });
    }

    function awaitKeyUp() {
        return new Promise((resolve) => {
            document.addEventListener('keyup', (e) => {
                e.stopImmediatePropagation();
                e.preventDefault();
                resolve(e.key)
            }, {once: true})
        })
    }

    async function createKeyMapping(prompts, modal) {
        let keyMap = new Map();
        modal.show();
        for (const prompt of prompts) {
            modal.appendText(`Pick a button for ${prompt}: `);
            let key = await getKeyDown(); // get the input, update our modal
            modal.appendText(` ${key}\n`);
            keyMap.set(key, prompt); // add it to the keymap
            // don't forget to close the modal here
            await awaitKeyUp();
        }
        modal.close();
        return(keyMap); // send the map back to the calling function
    }

    function keyMapModal(root) {
        let d = document.createElement('dialog');
        root.appendChild(d);

        this.show = () => {d.showModal()}
        this.appendText = (text) => {d.innerText += text}
        this.close = () => {
            d.close();
            root.removeChild(d);
        };
    }

    // calling function has a map from prompts -> functions, keymap makes a map from keys -> prompts
    // and you can just compose the two to get the map from keys -> functions to be called
    // consequence of this is that you can't assign two prompts/functions/actions to the same key

    // Application logic begins here:
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
    createKeyMapping(prompts, new keyMapModal(document.body)).then((keyMap) => {
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

    // Instantiate our controller:
    let answerList = makeAnswerList(answerChoices);
    let activeIndex = 0;
    answerList[activeIndex].focus();
})

setTimeout(AmKey, 5000);