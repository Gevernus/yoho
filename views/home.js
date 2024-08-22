export function init(entity) {
    const buySkipper = document.getElementById("buy-skipper");
    const backButton = document.getElementById("back-button");
};

export function render(entity) {
    const timerFill = document.querySelector('.timer-fill');
    const timerNumber = document.querySelector('.timer-number');

    const systemTime = document.getElementById("time");
    const coins = document.getElementById("coin-value");
    const income = document.getElementById("income-text");


    const coinsComponent = entity.getComponent('CoinsComponent');
    coins.textContent = coinsComponent.amount;

    const passiveIncomeComponent = entity.getComponent('PassiveIncomeComponent');
    income.textContent = `${passiveIncomeComponent.incomePerHour}/h`;

    const timerComponent = entity.getComponent('TimerComponent');
    timerNumber.textContent = (timerComponent.timer / 60).toFixed(0);
    const widthPercentage = (timerComponent.timer / 3600) * 90;

    // Set the width of the timer fill
    timerFill.style.width = `${widthPercentage}%`;

    const claimButton = document.getElementById("claim-button");
    const timerContainer = document.querySelector(".timer-container");
    if (timerComponent.timer >= 3600) {
        claimButton.style.display = 'inline-block';
        timerContainer.style.display = 'none';
    } else {
        claimButton.style.display = 'none';
        timerContainer.style.display = 'flex';
    }
};