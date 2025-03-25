function getKeyDown() {
    // Prepare for asynchronous output:
    return new Promise((resolve) => {
        // Listen for a keydown and send the key code to our keymapper
        document.addEventListener('keydown', onKeyHandler);
        function onKeyHandler(e) {
            e.stopImmediatePropagation();
            //e.preventDefault();
            resolve(e.key);
        }
    });
}

function awaitKeyUp() {
    return new Promise((resolve) => {
        document.addEventListener('keyup', (e) => {
            e.preventDefault();
            resolve(e.key)
        })
    })
}

async function createKeyMapping(prompts, modal) {
    let keyMap = new Map();
    for (const prompt of prompts) {
        modal(prompt); // Open a modal with the prompt so the user knows to make input
        keyMap.set(await getKeyDown(), prompt); // get the input, add it to the keymap
        // don't forget to close the modal here
        await awaitKeyUp();
    }
    return(keyMap); // send the map back to the calling function
}

// calling function has a map from prompts -> functions, keymap makes a map from keys -> prompts
// and you can just compose the two to get the map from keys -> functions to be called
// consequence of this is that you can't assign two prompts/functions/actions to the same key