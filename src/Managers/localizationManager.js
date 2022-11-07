
export function localizeAppTexts(strings) {
    domElement("enterButton").innerText = strings.enter;
    domElement("submitLogin").innerText = strings.enter;
    domElement("loginCloseButton").innerText = strings.close;
    domElement("hAreaRestricted").innerText = strings.areaRestricted;
    domElement("hAreaRestrictedSuccess").innerText = strings.loginSuccessfulMessage;
    domElement("pAreaRestricted").innerText = strings.areaRestrictedMessage;
    domElement("pWelcomeMessage").innerText = strings.welcomeMessage;
    domElement("labelPassword").innerText = strings.password + ':';
    domElement("pPasswordIncorrect").innerText = strings.wrongPasswordMessage;
}

function domElement(id) {
    return document.getElementById(id);
}