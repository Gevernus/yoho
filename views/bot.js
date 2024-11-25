export function init(entity) {
    const inputComponent = entity.getComponent('InputComponent');
    const coinsComponent = entity.getComponent('CoinsComponent');
    const shkiperComponent = entity.getComponent('ShkiperComponent');
    const walletComponent = entity.getComponent('WalletComponent');

    const backButton = document.getElementById("back-button");
    backButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "home" });
    });

    const cancelButton = document.getElementById("buying-bot-button-cancel");
    cancelButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "home" });
    });
    const wallet = walletComponent.getWallet();
    const buyButton = document.getElementById("buying-bot-button-buy");
    buyButton.addEventListener("click", async () => {        
        if (!wallet.connected) {
            alert("Please connect your wallet first");
            return;
        }
        const TonWeb = require('tonweb');
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
            messages: [
                {
                    address: new TonWeb.utils.Address("UQA52y0kSPWE6rde4VJykPR78rTjdh2Zv9AkS2irsebhinHe").toString(false),
                    amount: TonWeb.utils.toNano(1),
                }
            ]
        };
        try {
            const result = await wallet.sendTransaction(transaction);
            console.log("Transaction sent:", result);
            shkiperComponent.counter = 0;
            coinsComponent.amount += 2500;
            coinsComponent.all_amount += 2500;
            alert("Payment successful!");
        } catch (error) {
            console.error("Transaction failed:", error);
            alert("Payment failed. Please try again.");
        }
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