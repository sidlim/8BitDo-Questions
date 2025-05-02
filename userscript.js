// ==UserScript==
// @name        AmKey
// @namespace   AmKey
// @version     1.0
// @description Remap keys (from 8BitDo or other Anki Controllers) to interact with the practice test
// @match       *://*.amboss.com/*
// @grant       none
// @run-at      document-start
// ==/UserScript==

(function() {

    // Pick a level to override at:
    let root = HTMLAnchorElement;
    // Setup Maps of bound functions:
    let boundHandlers = new Map();

    console.log('AmKey: Setting up overrides');
    let addEventListener = root.prototype.addEventListener;
    let removeEventListener = root.prototype.removeEventListener;
    root.prototype.addEventListener = function(...args) {
        console.warn('Running custom binder for event listeners');
        switch(args[0]) {
            case 'keyup':
            case 'keydown':
            case 'keypress':
                // This is an event we want to intercept.
                // Build the intercept function, add it to our boundHandlers collection
                // and then replace the argument and bind our interception
                // instead of the original handler
                let originalHandler = args[1];
                if (boundHandlers.has(originalHandler)) {
                    console.warn('Overwriting a handler in boundHandlers WeakMap with target ', this);
                }
                let modifiedHandler = keyboardEventHandlerIntercepter(originalHandler);
                boundHandlers.set(originalHandler, modifiedHandler);
                args[1] = modifiedHandler;
        }
        addEventListener.call(this, ...args);
    }
    root.prototype.removeEventListener = function(...args) {
        switch(args[0]) {
            case 'keyup':
            case 'keydown':
            case 'keypress':
                // This is an event we are guaranteed to have intercepted.
                // Let's remove it from boundHandlers and then unbind the
                // modified version of this event handler:
                let originalHandler = args[1];
                if (!boundHandlers.has(originalHandler)) {
                    console.warn('Unbinding a handler not in boundHandlers WeakMap');
                }
                let modifiedHandler = boundHandlers.get(originalHandler);
                boundHandlers.delete(originalHandler);
                args[1] = modifiedHandler
        }
        removeEventListener.call(this, ...args);
    };

    let keyboardEventHandlerIntercepter = (f) => (e) => {
        if (e.key == 'ArrowRight') {
            console.log('pressed ArrowRight - not running handlers bound via addEventListener.')
        }
        else {
            f(e)
        }
    };

    window.EventHandlers = boundHandlers;
    
})()