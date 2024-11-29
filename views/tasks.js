export function init(entity) {
    const backButton = document.getElementById("back-button");
    const inputComponent = entity.getComponent('InputComponent');
    const coinsComponent = entity.getComponent('CoinsComponent');
    const referralsComponent = entity.getComponent('ReferralsComponent');
    backButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "home" });
    });

    const tasksComponent = entity.getComponent('TasksComponent');
    const claimItems = document.querySelectorAll('.task-claims-item');

    // Add click event listeners for claiming
    claimItems.forEach((item, index) => {
        item.addEventListener('click', function () {
            const currentDay = index + 1;
            const dayText = item.querySelector('.task-claims-text');
            // Only allow claiming if it's the current day and not already claimed
            console.log(`Current day is ${currentDay} and day text is ${dayText}`)
            if (dayText.textContent === 'Claim') {
                console.log(`Day: ${currentDay} claimed successfully`)
                tasksComponent.daysClaimed++;
                coinsComponent.amount += 500;
                coinsComponent.all_amount += 500;
                updateDailyRewards(tasksComponent.daysCounter, tasksComponent.daysClaimed);
            }
        });
    });
    updateDailyRewards(tasksComponent.daysCounter, tasksComponent.daysClaimed);

    const referralItems = document.querySelectorAll('.task-rewards-item');
    // Add click event listeners for claiming
    referralItems.forEach((item, index) => {
        item.addEventListener('click', function () {
            const currentDay = index + 1;
            const dayText = item.querySelector('.task-claims-text');
            if (dayText.textContent === 'Claim') {
                console.log(`Referrals: ${currentDay} claimed successfully`)
                tasksComponent.referralsClaimed++;
                coinsComponent.amount += 500;
                coinsComponent.all_amount += 500;
                updateInviteRewards(referralsComponent.items.length, tasksComponent.referralsClaimed);
            }
        });
    });
    updateInviteRewards(referralsComponent.items.length, tasksComponent.referralsClaimed);
};

function updateDailyRewards(daysCounter, daysClaimed) {
    const claimItems = document.querySelectorAll('.task-claims-item');

    claimItems.forEach((item, index) => {
        const dayText = item.querySelector('.task-claims-text');
        console.log(`Counter: ${daysCounter} and claimed: ${daysClaimed} for item`, item);
        // Day number starts from 1
        const currentDay = index + 1;

        // Reset visibility of text
        dayText.style.display = 'none';

        if (currentDay <= daysCounter) {
            if (currentDay <= daysClaimed) {
                // Day has been claimed
                dayText.textContent = 'Claimed';
                dayText.style.display = 'block';
                item.style.opacity = '1';
            } else if (currentDay <= daysCounter && currentDay <= daysClaimed + 1) {
                // Current day is ready to be claimed
                dayText.textContent = 'Claim';
                dayText.style.display = 'block';
                item.style.opacity = '1';
            } else {
                // Future days
                item.style.opacity = '0.8';
            }
        } else {
            // Days not yet reached
            item.style.opacity = '0.6';
        }
    });
}

function updateInviteRewards(referralsCounter, referralsClaimed) {
    const claimItems = document.querySelectorAll('.task-rewards-item');

    claimItems.forEach((item, index) => {
        const dayText = item.querySelector('.task-claims-text');
        console.log(`Counter: ${referralsCounter} and claimed: ${referralsClaimed} for item`, item);
        // Day number starts from 1
        const currentDay = parseInt(item.querySelector('.task-rewards-value').textContent);
        // Reset visibility of text
        dayText.style.display = 'none';

        if (currentDay <= referralsCounter) {
            if (currentDay <= referralsClaimed) {
                // Day has been claimed
                dayText.textContent = 'Claimed';
                dayText.style.display = 'block';
                item.style.opacity = '1';
            } else if (currentDay <= referralsCounter && currentDay <= referralsClaimed + 1) {
                // Current day is ready to be claimed
                dayText.textContent = 'Claim';
                dayText.style.display = 'block';
                item.style.opacity = '1';
            } else {
                // Future days
                item.style.opacity = '0.8';
            }
        } else {
            // Days not yet reached
            item.style.opacity = '0.6';
        }
    });
}

export function render(entity) {
}