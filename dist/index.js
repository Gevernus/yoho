import { StorageSystem, TelegramSystem, UISystem, TimerSystem, ActionsSystem } from './systems.js';
import { SystemManager } from './systemManager.js';
import { Entity } from './ecs.js';
import { CoinsComponent, TimerComponent, PassiveIncomeComponent, InputComponent, UserComponent, ItemsComponent, ReferralsComponent } from './components.js';

let lastTime = 0;
const targetFPS = 60;
const timeStep = 1000 / targetFPS;

const systemManager = new SystemManager();

async function initApp() {
    eruda.init();
    console.log('Trying to init app')
    const gameEntity = new Entity();
    const telegramSystem = new TelegramSystem(gameEntity);
    const uiSystem = new UISystem(gameEntity);
    systemManager.addSystem(uiSystem);
    const inputComponent = new InputComponent();
    gameEntity.addComponent(inputComponent);
    const storageSystem = new StorageSystem(gameEntity, telegramSystem.getUser(), telegramSystem.getInviter());
    const state = await storageSystem.getState();
    const user = await storageSystem.getUser();
    const items = await storageSystem.getItems();
    const referrals = await storageSystem.getReferrals();

    const lastUpdatedDate = new Date(state.last_updated);
    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - lastUpdatedDate.getTime()) / 1000);
    if (elapsedSeconds > 0) {
        state.timer += elapsedSeconds;
    }

    console.log(state.timer);
    systemManager.addSystem(telegramSystem);
    systemManager.addSystem(storageSystem)
    const coinsComponent = new CoinsComponent(state.coins)
    if (referrals && referrals.length > 0) {
        referrals.forEach(referral => {
            if (referral.status != 'claimed') {
                coinsComponent.amount += referral.bonus;
                referral.status = 'claimed';
                claim(user.id, referral.id);
            }
        });
    }
    gameEntity.addComponent(coinsComponent);
    gameEntity.addComponent(new PassiveIncomeComponent(items));
    gameEntity.addComponent(new UserComponent(user));
    gameEntity.addComponent(new TimerComponent(state.timer));
    gameEntity.addComponent(new ItemsComponent(items));
    gameEntity.addComponent(new ReferralsComponent(referrals));

    storageSystem.setEntity(gameEntity);

    // Initialize systems
    systemManager.addSystem(new ActionsSystem(gameEntity));
    systemManager.addSystem(new TimerSystem(gameEntity));

    systemManager.initAll();

    let currentLink = document.querySelector('.active');
    document.querySelectorAll('.navigate').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentLink) {
                currentLink.classList.remove('active');
            }

            // Add active class to the clicked link
            e.currentTarget.classList.add('active');

            // Update the currentLink
            currentLink = e.currentTarget;
            console.log('Nav link clicked');
            inputComponent.addInput("vibrate");
            uiSystem.setView(e.currentTarget.dataset.page || 'home');
        });
    });

    console.log('App inited')
    await uiSystem.setView('home');

    // Hide loading screen after initialization
    hideLoadingScreen();

    requestAnimationFrame((currentTime) => {
        lastTime = currentTime;
        tick(currentTime);
    });
    console.log('Frame requested')
}

async function claim(userId, referralId) {
    try {
        const response = await fetch(`api/${userId}/claim`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            json: { referralId: referralId },
        });
        if (!response.ok) {
            throw new Error('Failed to save state');
        }
    } catch (error) {
        console.error('Error saving state:', error);
    }
}

function tick(currentTime) {
    requestAnimationFrame(tick);

    // Calculate elapsed time
    const deltaTime = currentTime - lastTime;

    // If enough time has passed, update the game
    if (deltaTime >= timeStep) {
        lastTime = currentTime;
        systemManager.updateAll(deltaTime / 1000);
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
        // Show the actual content
        document.getElementById('main').style.display = 'flex';
    }
}

window.addEventListener('load', initApp);