import { StorageSystem, TelegramSystem, UISystem, TimerSystem, ActionsSystem } from './systems.js';
import { SystemManager } from './systemManager.js';
import { Entity } from './ecs.js';
import { CoinsComponent, TimerComponent, PassiveIncomeComponent, InputComponent, UserComponent } from './components.js';

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

    const lastUpdatedDate = new Date(state.last_updated);
    const now = new Date();

    // Calculate the time difference in seconds
    const elapsedSeconds = Math.floor((now.getTime() - lastUpdatedDate.getTime()) / 1000);
    console.log(`Added time you was offline to claim timer: `, elapsedSeconds);
    // Update the timer with the elapsed time
    state.timer += elapsedSeconds;

    systemManager.addSystem(telegramSystem);
    systemManager.addSystem(storageSystem)

    gameEntity.addComponent(new CoinsComponent(state.coins));
    gameEntity.addComponent(new PassiveIncomeComponent());
    gameEntity.addComponent(new UserComponent(user));
    gameEntity.addComponent(new TimerComponent(state.timer));

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
    }
}

window.addEventListener('load', initApp);