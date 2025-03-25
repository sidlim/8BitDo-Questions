# 8BitDo Questions:
A set of userscripts meant to let folks do practice questions using an Anki Remote.

## Features & Status:
- Amboss:
    - [x] Answer selection
    - [x] Answer strikethrough
    - [x] Answer explanation expansion
    - [x] Question navigation
    - [ ] Scrolling
    - [ ] Image expansion
    - [ ] Lab reference value screen
    - [ ] Explanation Link expansion
    - [ ] Keymapping
- UWorld
    - [x] Answer selection
    - [ ] Answer submission
    - [x] Question navigation
    - [ ] Scrolling
    - [ ] Image expansion
    - [ ] Lab reference value screen
    - [ ] Keymapping

## Use Instructions:
### Amboss/UWorld:
1. Connect your controller
2. Ensure your keymappings from the controller to the keyboard (in Karabiner Elements or your keymapping software of choice) are correct, as given below. This should cease to be an issue once the keymapping feature is supported, but until then this step will complicate things.
3. Open up a question session
4. Run the corresponding script (amboss.js or uworld.js) in the developer console.
### Keyboard Controls:
- Up/Down arrows: previous or next answer choice, respectively
- Left/Right arrows: previous or next question, respectively
- Enter: Select/Expand answer
- Backspace: Strikethrough answer
### Keymapping:
- Not yet functional; requires interception of registered event handlers, which I believe can't be done in Firefox (my main browser), so I've left this to a side for now.