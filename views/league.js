export function init(entity) {
    const inputComponent = entity.getComponent('InputComponent');
    const userComponent = entity.getComponent('UserComponent');
    const coinsComponent = entity.getComponent('CoinsComponent');

    const backButton = document.getElementById("back-button");
    backButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "home" });
    });
    const swiperInstance = new Swiper('.swiper', {
        // Optional parameters
        slidesPerView: 1,
        spaceBetween: 0,
        centeredSlides: true,

        navigation: {
            nextEl: '#league-button-next',
            prevEl: '#league-button-back',
        },


    });

    renderLeague(entity, 0);

    swiperInstance.on('slideChange', () => {
        renderLeague(entity, swiperInstance.activeIndex);
    });

    const claimButton = document.querySelector(".league-claim");
    claimButton.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`api/${userComponent.user.id}/claim-league`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const text = await response.text();
                alert(text);
                return;
            }

            const result = await response.json();
            coinsComponent.amount += parseInt(result.coins);
            coinsComponent.all_amount += parseInt(result.coins);
            alert(result.message);
        } catch (error) {
            console.error('Error saving state:', error);
        }
        claimButton.style.display = 'none';
    });
};

function renderLeague(entity, index = 0) {
    const total = document.getElementById("league-value-total");
    const current = document.getElementById("league-value-has");
    const claimButton = document.querySelector(".league-claim");
    const container = document.querySelector(".league-value-inner");

    const leagueComponent = entity.getComponent("LeagueComponent");
    const passiveIncomeComponent = entity.getComponent('PassiveIncomeComponent');

    total.textContent = (leagueComponent.leagueGoal * (index + 1));
    let widthPercentage = 0;
    if (leagueComponent.getLeagueIndex(passiveIncomeComponent.incomePerHour) > index) {
        current.textContent = leagueComponent.leagueGoal;
        if (leagueComponent.leagueClaimed <= index) {
            claimButton.style.display = 'block';
        } else {
            claimButton.style.display = 'none';
        }
        widthPercentage = 100;
    } else if (leagueComponent.getLeagueIndex(passiveIncomeComponent.incomePerHour) == index) {
        current.textContent = leagueComponent.getLeagueValue(passiveIncomeComponent.incomePerHour);
        claimButton.style.display = 'none';
        widthPercentage = leagueComponent.getLeagueValue(passiveIncomeComponent.incomePerHour) / (leagueComponent.leagueGoal * (index + 1)) * 90;
    } else {
        current.textContent = 0;
        claimButton.style.display = 'none';
    }

    container.style.width = `${widthPercentage}%`;
}

export function render(entity) {

}