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

    const buyButton = document.getElementById("buying-bot-button-buy");
    buyButton.addEventListener("click", async () => {
        const wallet = walletComponent.getWallet();
        if (!wallet) {
            alert("Please connect your wallet first");
            return;
        }
        const tonWeb = new TonWeb;
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
            messages: [
                {
                    address: tonWeb.utils.Address("UQCz3IWNAgm6JA9xjHb9uJleO5JA3SLM6f2BVBNJdPmeIOPO").toString(false),
                    amount: tonWeb.utils.toNano(1),
                }
            ]
        };
        try {
            const result = await walletComponent.getWallet().sendTransaction(transaction);
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