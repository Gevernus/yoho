export function init(entity) {
    const backButton = document.getElementById("back-button");
    const inputComponent = entity.getComponent('InputComponent');
    backButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "home" });
    });

    const connectButton = document.querySelector(".wallet-connect");
    const disconnectButton = document.querySelector(".wallet-disconnect");
    disconnectButton.style.display = 'none';
    const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
        manifestUrl: 'https://yoho-webapp.com/tonconnect-manifest.json',
        buttonRootId: 'ton-connect'
    });
    tonConnectUI.uiOptions = {
        twaReturnUrl: 'https://t.me/yoho_nw_bot/YOHO'
    };
};

export function render(entity) {

}