export function init(entity) {

    const inputComponent = entity.getComponent('InputComponent');
    const coinsComponent = entity.getComponent('CoinsComponent');
    const shkiperComponent = entity.getComponent('ShkiperComponent');

    const backButton = document.getElementById("back-button");
    backButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "home" });
    });

    const cancelButton = document.getElementById("buying-bot-button-cancel");
    cancelButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "home" });
    });

    const buyButton = document.getElementById("buying-bot-button-buy");
    buyButton.addEventListener("click", () => {
        shkiperComponent.counter = 0;
        coinsComponent.amount += 2500;
        coinsComponent.all_amount += 2500;
    });
    renderPage(entity);
};

function renderPage(entity) {
    const shkiperComponent = entity.getComponent('ShkiperComponent');

    // Get references to the DOM elements
    const buyButton = document.getElementById('buying-bot-button-buy');
    const cancelButton = document.getElementById('buying-bot-button-cancel');
    const label = document.getElementById('buying-bot-label');

    // Check if the counter is >= 0
    if (shkiperComponent.counter >= 0) {
        buyButton.style.display = 'none';
        cancelButton.style.display = 'none';
        label.style.display = 'inline';
    } else {
        buyButton.style.display = 'inline';
        cancelButton.style.display = 'inline';
        label.style.display = 'none';
    }
}

export function render(entity) {
    renderPage(entity);
}