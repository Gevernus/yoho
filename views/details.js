export function init(entity) {
    const inputComponent = entity.getComponent('InputComponent');
    const backButton = document.getElementById("back-button");
    backButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "shop" });
    });
};

export function render(entity) {
}