export function init(entity) {
    const backButton = document.getElementById("back-button");
    const inputComponent = entity.getComponent('InputComponent');
    backButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "home" });
    });

    const connectButton = document.querySelector(".wallet-connect");
    const disconnectButton = document.querySelector(".wallet-disconnect");
    disconnectButton.style.display = 'none';
};

export function render(entity) {

}