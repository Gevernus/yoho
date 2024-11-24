export function init(entity) {
    const backButton = document.getElementById("back-button");
    const inputComponent = entity.getComponent('InputComponent');
    const walletComponent = entity.getComponent('WalletComponent');
    backButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "home" });
    });

    const connectButton = document.querySelector(".wallet-connect");
    const disconnectButton = document.querySelector(".wallet-disconnect");
    disconnectButton.style.display = 'none';
    walletComponent.getWallet();
};

export function render(entity) {

}