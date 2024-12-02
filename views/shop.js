let currentEntity = null;

export function init(entity) {
    currentEntity = entity;
    const userComponent = entity.getComponent('UserComponent');
    const inputComponent = entity.getComponent('InputComponent');

    const items = entity.getComponent('ItemsComponent');
    const playerAvatar = document.getElementById('player-avatar');
    const playerName = document.getElementById('player-username');
    playerAvatar.style.backgroundImage = `url(https://t.me/i/userpic/320/${userComponent.user.username}.jpg)`;
    // playerAvatar.style.backgroundImage = `url(https://t.me/i/userpic/320/${"gevernus"}.jpg)`;
    playerName.textContent = userComponent.user.username;
    const backButton = document.getElementById("back-button");

    const codeComponent = entity.getComponent('CodeComponent');
    const comboTime = document.querySelector(".combo-time");
    const comboTimeValue = document.getElementById("combo-time-value");
    const codeErrorDate = new Date(codeComponent.codeErrorDate);
    const now = new Date();
    const timeDifferenceMs = now.getTime() - codeErrorDate.getTime();
    const minutesSinceUpdate = Math.floor(timeDifferenceMs / (1000 * 60));
    const remainingMinutes = Math.max(0, 60 - minutesSinceUpdate);
    const confirmButton = document.getElementById('confirm');

    if (remainingMinutes > 0) {
        comboTimeValue.textContent = remainingMinutes;
        comboTime.style.display = 'block';
        confirmButton.disabled = true;
    } else {
        comboTime.style.display = 'none';
    }

    backButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "home" });
    });

    const cancelButton = document.querySelector(".cancel-btn");
    cancelButton.addEventListener("click", closeModal);

    const skinsButton = document.getElementById("skins-button");
    skinsButton.addEventListener("click", () => {
        inputComponent.addInput("setView", { view: "details" });
    });

    window.onclick = function (event) {
        if (event.target == document.getElementById('modal')) {
            closeModal();
        }
    }
    setupTabs(items.items);
    populateShop(items.items.filter(item => item.type === "ship"));

    const comboPickers = document.querySelectorAll('.combo-picker');
    
    const claimButton = document.getElementById('claim');

    claimButton.style.display = 'none';
    confirmButton.style.display = 'block';

    let currentCode = [0, 0, 0, 0];
    const correctCode = Array.from(codeComponent.code, Number);
    let startY = null;
    let isHolding = false;
    let holdTimeout = null;

    comboPickers.forEach((picker) => {
        const index = parseInt(picker.dataset.index);

        picker.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startHolding(picker, e.clientY);
        });

        picker.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startHolding(picker, touch.clientY);
        });

        function startHolding(picker, clientY) {
            startY = clientY;
            isHolding = true;

            holdTimeout = setTimeout(() => {
                if (isHolding) {
                    picker.style.overflow = 'visible';
                    // Optionally do something after holding for a certain time
                }
            }, 10);

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onRelease);
            document.addEventListener('touchmove', onTouchMove);
            document.addEventListener('touchend', onRelease);
        }

        function onMouseMove(e) {
            if (isHolding) {
                handleMovement(e.clientY);
            }
        }

        function onTouchMove(e) {
            if (isHolding) {
                const touch = e.touches[0];
                handleMovement(touch.clientY);
            }
        }

        function handleMovement(currentY) {
            if (startY !== null) {
                const deltaY = currentY - startY;

                if (deltaY > 20) { // Swipe down
                    currentCode[index] = (currentCode[index] === 0) ? 9 : currentCode[index] - 1; // Circular decrement
                    updateWheelPickerDisplay(index);
                    startY = currentY; // Reset startY to avoid multiple changes on small movements
                } else if (deltaY < -20) { // Swipe up
                    currentCode[index] = (currentCode[index] === 9) ? 0 : currentCode[index] + 1; // Circular increment
                    updateWheelPickerDisplay(index);
                    startY = currentY; // Reset startY to avoid multiple changes on small movements
                }
            }
        }

        function onRelease(e) {
            isHolding = false;
            startY = null;
            clearTimeout(holdTimeout);
            picker.style.overflow = 'hidden';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onRelease);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onRelease);
        }

        function updateWheelPickerDisplay(index) {
            const picker = comboPickers[index];
            const valueWrapper = picker.querySelector('.combo-value-wrapper');

            const currentValue = currentCode[index];
            const prevValue = (currentValue === 0) ? 9 : currentValue - 1;
            const nextValue = (currentValue === 9) ? 0 : currentValue + 1;

            const prevElement = valueWrapper.querySelector('.prev-value');
            const currentElement = valueWrapper.querySelector('.current-value');
            const nextElement = valueWrapper.querySelector('.next-value');

            prevElement.textContent = prevValue;
            currentElement.textContent = currentValue;
            nextElement.textContent = nextValue;
        }
    });

    confirmButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (JSON.stringify(currentCode) === JSON.stringify(correctCode)) {
            claimButton.style.display = 'block';
            confirmButton.style.display = 'none';
            claimButton.disabled = false;
            confirmButton.disabled = true;
        } else {
            codeComponent.codeErrorDate = new Date().toISOString();
            alert(`Incorrect code! ${currentCode}`);
        }
    });

    claimButton.addEventListener('click', (e) => {
        e.preventDefault();
        claimCode(entity, currentCode.join(''));
        claimButton.disabled = true;
        confirmButton.disabled = false;
        claimButton.style.display = 'none';
        confirmButton.style.display = 'block';
    });

};

async function claimCode(entity, code) {
    const userComponent = entity.getComponent('UserComponent');
    const coinsComponent = entity.getComponent('CoinsComponent');
    try {
        console.log(`Code to send is ${code}`);
        const response = await fetch(`api/${userComponent.user.id}/claim-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
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
}

function setupTabs(shopItems) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active-tab'));

            // Add active class to the clicked tab
            tab.classList.add('active-tab');

            // Get the type from the clicked tab
            const type = tab.textContent.toLowerCase();

            // Filter items based on the selected type
            const filteredItems = shopItems.filter(item => item.type === type);

            // Populate the shop with filtered items
            populateShop(filteredItems);
        });
    });
}

function populateShop(shopItems) {
    const container = document.getElementById('shop-elements');
    container.innerHTML = ''; // Clear existing items
    shopItems.forEach(item => {
        container.appendChild(createShopElement(item));
    });
}

function openModal(element, item) {
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('itemName').textContent = element.dataset.name;
    document.getElementById('itemLevel').textContent = element.dataset.level;
    document.getElementById('itemCost').textContent = element.dataset.cost;
    document.getElementById('yourCoins').textContent = element.dataset.coins;
    document.getElementById('itemBonus').textContent = element.dataset.nextBonus;
    const disabled = parseInt(element.dataset.coins, 10) < parseInt(element.dataset.cost, 10);
    document.querySelector('.update-btn').src = disabled ? '/images/update-button-disabled.svg' : '/images/update-button.svg';
    if (disabled) {
        document.querySelector('.update-btn').style.pointerEvents = 'none';
    } else {
        document.querySelector('.update-btn').style.pointerEvents = 'auto';
        const updateButton = document.querySelector(".update-btn");
        updateButton.removeEventListener("click", updateHandler);
        updateButton.addEventListener("click", updateHandler.bind(null, element, item));
    }
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function updateHandler(element, item) {
    handleUpdate(element, item);
}

async function handleUpdate(element, item) {
    const coinsComponent = currentEntity.getComponent('CoinsComponent');
    const passiveIncomeComponent = currentEntity.getComponent('PassiveIncomeComponent');
    const userComponent = currentEntity.getComponent('UserComponent');
    const itemsComponent = currentEntity.getComponent('ItemsComponent');
    try {
        const response = await fetch(`api/${userComponent.user.id}/items/upgrade/${item.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            json: item.id,
        });

        if (!response.ok) {
            throw new Error('Failed to save state');
        }
        coinsComponent.amount -= parseInt(element.dataset.cost, 10);
        console.log(`Data set `, element.dataset);
        passiveIncomeComponent.incomePerHour -= parseInt(element.dataset.bonus, 10);
        passiveIncomeComponent.incomePerHour += parseInt(element.dataset.nextBonus, 10);

        const result = await response.json();
        const newItem = result.userItem;
        const level = newItem.level;
        const price = Math.round(newItem.item.cost * Math.pow(1.50, level - 1));
        const bonus = Math.round(newItem.item.passive_bonus * Math.pow(1.50, level - 1));

        const itemIndex = itemsComponent.items.findIndex(item => item.id === newItem.item.id);

        if (itemIndex !== -1) {
            itemsComponent.items[itemIndex].userItems[0] = newItem;
        }

        // Update the DOM element
        element.querySelector('.price').textContent = price;
        element.querySelector('.plus-income').textContent = `+${bonus}/h`;
    } catch (error) {
        console.error('Error saving state:', error);
    }
    closeModal();
}

function createShopElement(item) {
    const level = item.userItems && item.userItems.length > 0 ? item.userItems[0].level : 1;
    const price = Math.round(item.cost * Math.pow(1.50, level - 1));
    const bonus = level == 1 ? 0 : Math.round(item.passive_bonus * Math.pow(1.50, level - 1));
    const nextBonus = Math.round(item.passive_bonus * Math.pow(1.50, level));
    const element = document.createElement('div');
    element.className = 'shop-element';
    element.innerHTML = `
                <img class="item-back" src="images/shop-item-back.svg" alt="item">
                <img class="item-image" src="images/${item.image}" alt="item">
                <div class="item-footer">
                    <span class="price">${price}</span>
                    <img class="item-coin" src="/images/mini-coin.svg" alt="mini-coin">
                    <span class="plus-income">+${bonus}/h</span>
                </div>
            `;
    const coinsComponent = currentEntity.getComponent('CoinsComponent');
    element.dataset.name = item.name;
    element.dataset.id = item.id;
    element.dataset.level = level + 1;
    element.dataset.cost = price;
    element.dataset.bonus = bonus;
    element.dataset.nextBonus = nextBonus;
    element.dataset.coins = coinsComponent.amount;
    element.addEventListener('click', () => openModal(element, item));
    return element;
}

export function render(entity) {
    const passiveIncomeComponent = entity.getComponent('PassiveIncomeComponent');
    const coinsComponent = entity.getComponent('CoinsComponent');
    document.getElementById("income-text").textContent = `${passiveIncomeComponent.incomePerHour}/h`;
    document.getElementById("coins-text").textContent = `${coinsComponent.amount}`;

    const codeComponent = entity.getComponent('CodeComponent');
    const comboTime = document.querySelector(".combo-time");
    const comboTimeValue = document.getElementById("combo-time-value");
    const codeErrorDate = new Date(codeComponent.codeErrorDate);
    const now = new Date();
    const timeDifferenceMs = now.getTime() - codeErrorDate.getTime();
    const minutesSinceUpdate = Math.floor(timeDifferenceMs / (1000 * 60));
    const remainingMinutes = Math.max(0, 60 - minutesSinceUpdate);
    const confirmButton = document.getElementById('confirm');

    if (remainingMinutes > 0) {
        comboTimeValue.textContent = remainingMinutes;
        comboTime.style.display = 'block';
        confirmButton.disabled = true;
    } else {
        confirmButton.disabled = false;
        comboTime.style.display = 'none';
    }
}