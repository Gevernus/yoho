export function init(entity) {
    const backButton = document.getElementById("back-button");
    const inputComponent = entity.getComponent('InputComponent');
    backButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "home" });
    });
};

export function render(entity) {
}