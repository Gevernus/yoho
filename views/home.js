export function init(entity) {
    const buySkipper = document.getElementById("buy-skipper");
    
    const claimButton = document.getElementById("claim-button");
    const coinsComponent = entity.getComponent('CoinsComponent');
    const timerComponent = entity.getComponent('TimerComponent');
    const inputComponent = entity.getComponent('InputComponent');
    const passiveIncomeComponent = entity.getComponent('PassiveIncomeComponent');

    claimButton.addEventListener("click", () => {
        coinsComponent.amount += passiveIncomeComponent.incomePerHour;
        timerComponent.timer = 0;
    });

    buySkipper.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "bot" });
    });

    const leagueButton = document.querySelector(".league-button");
    leagueButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "league" });
    });
};

function renderClaimComponent(entity){
    const claimContainer = document.getElementById("claim-container");
    const incomeContainer = document.getElementById("income");
    const timerContainer = document.querySelector(".timer-container");
    if (timerComponent.timer >= 3600) {
        claimContainer.style.display = 'flex';
        timerContainer.style.display = 'none';
        incomeContainer.style.display = 'none';
        const passiveIncomeComponent = entity.getComponent('PassiveIncomeComponent');
        const claimValue = document.getElementById("claim-value-coins");
        claimValue.textContent = passiveIncomeComponent.incomePerHour;

    } else {
        claimContainer.style.display = 'none';
        timerContainer.style.display = 'flex';
        incomeContainer.style.display = 'flex';
    }
}

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

    const claimContainer = document.getElementById("claim-container");
    const incomeContainer = document.getElementById("income");
    const timerContainer = document.querySelector(".timer-container");
    if (timerComponent.timer >= 3600) {
        claimContainer.style.display = 'flex';
        timerContainer.style.display = 'none';
        incomeContainer.style.display = 'none';
        const passiveIncomeComponent = entity.getComponent('PassiveIncomeComponent');
        const claimValue = document.getElementById("claim-value-coins");
        claimValue.textContent = passiveIncomeComponent.incomePerHour;

    } else {
        claimContainer.style.display = 'none';
        timerContainer.style.display = 'flex';
        incomeContainer.style.display = 'flex';
    }
};