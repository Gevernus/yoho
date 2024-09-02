export function init(entity) {

    const inputComponent = entity.getComponent('InputComponent');
    const backButton = document.getElementById("back-button");
    backButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "home" });
    });

    const cancelButton = document.getElementById("buying-bot-button-cancel");
    cancelButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "home" });
    });
};

export function render(entity) {

}