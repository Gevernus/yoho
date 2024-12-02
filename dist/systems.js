import { System } from './ecs.js';
import { CoinsComponent, ViewComponent, InputComponent, PassiveIncomeComponent, TimerComponent, ShkiperComponent, TasksComponent, CodeComponent } from './components.js';

export class TimerSystem extends System {
    async init() {
    }

    update(deltaTime) {
        if (this.entity.hasComponent(TimerComponent)) {
            const timerComponent = this.entity.getComponent(TimerComponent);
            timerComponent.timer += deltaTime;
            timerComponent.timer = Math.min(3600, timerComponent.timer);
        }

        if (this.entity.hasComponent(ShkiperComponent)) {
            const shkiperComponent = this.entity.getComponent(ShkiperComponent);
            if (shkiperComponent.counter >= 2) {
                shkiperComponent.timer += deltaTime;
                shkiperComponent.timer = Math.min(3600 * 12, shkiperComponent.timer);
                if (shkiperComponent.timer >= 3600) {
                    shkiperComponent.timer = 0;
                    shkiperComponent.counter = 0;
                }
            }

        }
    }
}

export class TelegramSystem extends System {
    constructor(entity) {
        super(entity);
        this.user = null;
        this.initTelegram();
    }

    initTelegram() {
        if (window.Telegram && window.Telegram.WebApp) {
            this.user = window.Telegram.WebApp.initDataUnsafe.user || { id: 1, first_name: 'Test', last_name: 'User', username: 'test' };
            if (!this.user.username) {
                this.user.username = this.user.id;
            }
            this.inviterId = window.Telegram.WebApp.initDataUnsafe.start_param;
            console.log(`App opened with start_param: ${this.inviterId}`);
            window.Telegram.WebApp.disableVerticalSwipes();
            window.Telegram.WebApp.expand();
            // Listen for viewport changes, which include app closure
            window.Telegram.WebApp.onEvent('viewportChanged', async () => {
                if (window.Telegram.WebApp.isExpanded === false) {
                    // The app is being closed
                    // await updateDataBeforeClose();
                }
            });

            console.log('Telegram user initialized:', this.user);
        } else {
            console.error('Telegram WebApp is not available');
        }
    }

    getUser() {
        return this.user;
    }

    getInviter() {
        return this.inviterId;
    }

    getUserId() {
        return this.user ? this.user.id : null;
    }

    getUserName() {
        return this.user ? this.user.username : null;
    }

    update() {
        const inputComponent = this.entity.getComponent(InputComponent);

        const link = inputComponent.getAndRemoveInputs('openInvoice');

        if (link && link.length > 0 && link[0].data) {
            window.Telegram.WebApp.openInvoice(link[0].data.url, link[0].data.callback);
        }

        const url = inputComponent.getAndRemoveInputs('openLink');
        if (url && url.length > 0 && url[0].data) {
            window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${url[0].data.url}`);
        }

        const vibrate = inputComponent.getAndRemoveInputs('vibrate');
        if (vibrate && vibrate.length > 0) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }
    }
}

export class StorageSystem extends System {
    constructor(entity, tgUser, inviter) {
        super(entity);
        this.tgUser = tgUser;
        this.inviter = inviter;
        this.state = null;
        this.config = null;
        this.user = null;
        this.timeToSave = 5;
        this.timer = 0;
    }

    setEntity(entity) {
        this.entity = entity;
    }

    setState(state) {
        this.state = state;
    }

    async getState() {
        if (!this.state) {
            await this.loadState();
        }
        return this.state;
    }

    async getConfig() {
        if (!this.config) {
            await this.loadState();
        }
        return this.config;
    }

    async getUser() {
        if (!this.user) {
            await this.loadState();
        }
        return this.user;
    }

    async getItems() {
        console.log('Trying to get items')
        try {
            const response = await fetch(`api/${this.tgUser.id}/items`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed getting items');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed getting items:', error);
        }
    }

    async getReferrals() {
        try {
            const response = await fetch(`api/${this.tgUser.id}/referrals`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed getting referrals');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed getting referrals:', error);
        }
    }

    async getConfig() {
        try {
            const response = await fetch(`api/config`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed getting code');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed getting code:', error);
        }
    }

    async saveState() {
        if (!this.entity) {
            console.error('No entity provided to save state');
            return;
        }

        const coinsComponent = this.entity.getComponent(CoinsComponent);
        const shkiperComponent = this.entity.getComponent(ShkiperComponent);
        const passiveIncomeComponent = this.entity.getComponent(PassiveIncomeComponent);
        const timerComponent = this.entity.getComponent(TimerComponent);
        const tasksComponent = this.entity.getComponent(TasksComponent);
        const codeComponent = this.entity.getComponent(CodeComponent);

        if (!coinsComponent || !timerComponent || !passiveIncomeComponent) {
            console.error('Entity is missing required components for saving state');
            return;
        }


        this.state.coins = Math.floor(coinsComponent.amount);
        this.state.all_coins = Math.floor(coinsComponent.all_amount);
        this.state.timer = Math.floor(timerComponent.timer);
        this.state.passive_income = passiveIncomeComponent.incomePerHour;
        this.state.shkiper_counter = shkiperComponent.counter;
        this.state.shkiper_timer = shkiperComponent.timer;
        this.state.days_counter = tasksComponent.daysCounter;
        this.state.days_claimed = tasksComponent.daysClaimed;
        this.state.referrals_claimed = tasksComponent.referralsClaimed;
        if (codeComponent.codeErrorDate) {
            this.state.code_error = codeComponent.codeErrorDate;
        }

        try {
            const response = await fetch('api/state', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state),
            });

            if (!response.ok) {
                throw new Error('Failed to save state');
            }

            console.log('State saved successfully');
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    async loadState() {
        try {
            const response = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userData: this.tgUser, inviterId: this.inviter }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.state = data.state;
            this.user = data.user;
            this.config = data.config;
        } catch (error) {
            console.error('Error loading state:', error);
        }
    }

    async update(deltaTime) {
        this.timer += deltaTime;
        this.updateTimer += deltaTime;
        const inputComponent = this.entity.getComponent(InputComponent);
        const save = inputComponent.getAndRemoveInputs('save');
        if (this.timer >= this.timeToSave || save && save.length > 0) {
            this.timer = 0;
            this.saveState();
        }
    }
}

export class UISystem extends System {
    constructor(entity) {
        super(entity);
        this.views = {};
        this.currentView = null;
    }

    async loadView(viewName) {
        if (!this.views[viewName]) {
            const view = new ViewComponent(viewName);
            await view.load();
            this.views[viewName] = view;
        }
        return this.views[viewName];
    }

    async setView(viewName, container = 'content') {
        try {
            const view = await this.loadView(viewName);
            console.log("View is loaded: ", view);
            this.entity.getComponent(InputComponent).addInput("action", { name: `${viewName}Opened` });
            this.currentView = view;
            document.getElementById(container).innerHTML = view.template;
            view.init(this.entity);
        } catch (error) {
            console.error(`Error setting view ${viewName}:`, error);
        }
    }

    update() {
        const inputComponent = this.entity.getComponent('InputComponent');
        const setViewInput = inputComponent.getAndRemoveInputs('setView');

        if (setViewInput && setViewInput.length > 0 && setViewInput[0].data) {
            this.setView(setViewInput[0].data.view);
        }
        if (this.currentView) {
            this.currentView.render(this.entity);
        }
    }
}

export class ActionsSystem extends System {
    constructor(entity) {
        super(entity);
    }

    async update(deltaTime) {
        const inputComponent = this.entity.getComponent(InputComponent);

        // Handle show popup input
        const action = inputComponent.getAndRemoveInputs('action');
        if (action && action.length > 0 && action[0].data) {
            console.log(`Action captured: `, action);
            const actionName = action[0].data.name;
            // Track Google Analytics event
            // this.trackActionEvent(actionName);
        }
    }

    trackActionEvent(actionName) {
        // Check if gtag is available
        if (typeof gtag === 'function') {
            gtag('event', 'user_action', {
                'action_name': actionName,
                // You can add more parameters here if needed
            });
        } else {
            console.warn('Google Analytics not loaded. Unable to track event.');
        }
    }

    findMatchingTasks(tasksComponent, actionName) {
        return tasksComponent.tasks.filter(task => task.task_targetAction == actionName);
    }

    async updateTaskProgress(tasks, userId) {
        let result = null;
        for (const task of tasks) {
            try {
                const response = await fetch(`/api/${userId}/tasks/${task.task_id}/progress`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error(`Failed to update progress for task ${task.task_id}`);
                }
                const data = await response.json();
                if (data) {
                    result = data;
                }

                return result;
            } catch (error) {
                console.error(`Error updating progress for task ${task.task_id}:`, error);
            }
        }
    }
}