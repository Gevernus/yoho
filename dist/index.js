import { StorageSystem, TelegramSystem, UISystem, TimerSystem, ActionsSystem } from './systems.js';
import { SystemManager } from './systemManager.js';
import { Entity } from './ecs.js';
import { CoinsComponent, TimerComponent, PassiveIncomeComponent, InputComponent, UserComponent, ItemsComponent, ReferralsComponent, LeagueComponent, ShkiperComponent } from './components.js';

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

    systemManager.addSystem(telegramSystem);
    systemManager.addSystem(storageSystem);
    gameEntity.addComponent(new CoinsComponent(state.coins, state.all_coins));
    gameEntity.addComponent(new PassiveIncomeComponent(items));
    gameEntity.addComponent(new UserComponent(user));
    gameEntity.addComponent(new TimerComponent(state.timer));
    gameEntity.addComponent(new ItemsComponent(items));
    gameEntity.addComponent(new ReferralsComponent(referrals));
    gameEntity.addComponent(new LeagueComponent(state.league));
    gameEntity.addComponent(new ShkiperComponent(state.shkiper_counter, state.shkiper_timer));

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
    const images = Array.from(document.querySelectorAll("img"));

    Promise.all(
        images
            .filter(img => !img.complete) // Only filter out images that are not complete
            .map(img => new Promise(resolve => {
                img.onload = () => {
                    console.log(`Image loaded: ${img.src}`);
                    resolve(); // Resolve the promise when image is successfully loaded
                };
                img.onerror = () => {
                    console.log(`Failed to load image: ${img.src}`);
                    resolve(); // Resolve even on error, so the page can still continue
                };
            }))
    ).then(() => {
        console.log("All images have finished loading.");
        document.getElementById('loading-screen').style.display = 'none';
    });
}

window.addEventListener('load', initApp);