//let nextbutton = document.querySelectorAll('[data-e2e-te-id="next-button"]')[0];
let recursiveGetEventListeners = (target, include) => {
    let listeners = getEventListeners(target);
    let filtered_listeners = Object.keys(listeners).filter(k => include.has(k)).reduce((obj, key) => {
        return listeners[key];
    }, []);
    let listener_list = filtered_listeners.map(listener => {listener.target = target; return listener});
    let children = target.childNodes;
    for (child of children) {
        listener_list.push( ...recursiveGetEventListeners(child, include));
    }
    return(listener_list);
}


let removeEventListeners = (eventType, root) => {
    let listeners = recursiveGetEventListeners(root, new Set([eventType]));

    for (listener of listeners) {
        listener.target.removeEventListener(eventType, listener.listener);
    }
}

removeEventListeners('keyup', document);
removeEventListeners('keydown', document);
removeEventListeners('keypress', document);



// Override addEventListener:
(function() {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
  
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      console.log(`addEventListener called for event type: ${type}`);
      originalAddEventListener.call(this, type, listener, options);
    };
  })();