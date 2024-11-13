export function init(entity) {
    const buySkipper = document.getElementById("buy-skipper");

    const claimButton = document.getElementById("claim-button");
    const coinsComponent = entity.getComponent('CoinsComponent');
    const timerComponent = entity.getComponent('TimerComponent');
    const inputComponent = entity.getComponent('InputComponent');
    const leagueComponent = entity.getComponent('LeagueComponent');
    const passiveIncomeComponent = entity.getComponent('PassiveIncomeComponent');
    const shkiperComponent = entity.getComponent('ShkiperComponent');

    claimButton.addEventListener("click", () => {
        if (shkiperComponent.counter >= 0 && shkiperComponent.counter < 2) {
            shkiperComponent.counter++;
            coinsComponent.amount += passiveIncomeComponent.incomePerHour * 12;
        } else {
            coinsComponent.amount += passiveIncomeComponent.incomePerHour;
        }

        timerComponent.timer = 0;
    });

    buySkipper.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "bot" });
    });

    const leagueButton = document.querySelector(".league-button");
    leagueButton.textContent = `${leagueComponent.league} LEAGUE`
    leagueButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "league" });
    });
};

// function renderClaimComponent(entity) {
//     const claimContainer = document.getElementById("claim-container");
//     const incomeContainer = document.getElementById("income");
//     const timerContainer = document.querySelector(".timer-container");
//     if (timerComponent.timer >= 3600) {
//         claimContainer.style.display = 'flex';
//         timerContainer.style.display = 'none';
//         incomeContainer.style.display = 'none';
//         const passiveIncomeComponent = entity.getComponent('PassiveIncomeComponent');
//         // const claimValue = document.getElementById("claim-value-coins");
//         // claimValue.textContent = passiveIncomeComponent.incomePerHour;

//     } else {
//         claimContainer.style.display = 'none';
//         timerContainer.style.display = 'flex';
//         incomeContainer.style.display = 'flex';
//     }
// }

export function render(entity) {
    const timerFill = document.querySelector('.timer-fill');
    const timerNumber = document.querySelector('.timer-number');
    const timerUnit = document.querySelector('.timer-unit');

    const coins = document.getElementById("coin-value");
    const income = document.getElementById("income-text");

    const coinsComponent = entity.getComponent('CoinsComponent');
    coins.textContent = coinsComponent.amount;

    const passiveIncomeComponent = entity.getComponent('PassiveIncomeComponent');
    income.textContent = `${passiveIncomeComponent.incomePerHour}/h`;

    const timerComponent = entity.getComponent('TimerComponent');
    const shkiperComponent = entity.getComponent('ShkiperComponent');
    const startTime = shkiperComponent.counter >= 0 && shkiperComponent.counter < 2 ? 60 * 60 * 12 : 60 * 60;

    const remainingTime = startTime - timerComponent.timer;

    timerNumber.textContent = (remainingTime / 60).toFixed(0);

    // Optionally, you can stop the timer at 0 if you want:
    if (remainingTime <= 0) {
        timerNumber.textContent = "FULL";
        timerUnit.style.display = 'none';
    } else {
        timerUnit.style.display = 'block';
    }

    if (remainingTime > 60 * 60) {
        timerNumber.textContent = (remainingTime / 3600).toFixed(0);
        timerUnit.textContent = 'h'
    } else {
        timerUnit.textContent = 'min'
    }

    const widthPercentage = (timerComponent.timer / startTime) * 90;

    // Set the width of the timer fill
    timerFill.style.width = `${widthPercentage}%`;

    const claimContainer = document.getElementById("claim-container");
    const buySkipper = document.getElementById("buy-skipper");

    if (timerComponent.timer >= startTime) {
        claimContainer.style.display = 'flex';
        buySkipper.style.display = 'none';
    } else {
        claimContainer.style.display = 'none';
        buySkipper.style.display = 'inline';
    }

    if (shkiperComponent.counter >= 2) {
        
        buySkipper.textContent = `shkiper on rest ${timerNumber.textContent} ${timerUnit.textContent}`
    } else if (shkiperComponent.counter >= 0) {
        buySkipper.textContent = 'shkiper on work'
    } else {
        buySkipper.textContent = 'buy shkiper'
    }
};