export class CoinsComponent {
    constructor(amount = 0) {
        this.amount = amount;
    }
}

export class PassiveIncomeComponent {
    constructor() {
        this.incomePerHour = 100;
    }
}

export class TimerComponent {
    constructor(timer) {
        this.timer = timer;
    }
}

export class ShopComponent {
    constructor(shopData = []) {
        this.shopData = shopData;
    }
}

export class UserComponent {
    constructor(user) {
        this.user = user;
    }
}

export class InputComponent {
    constructor() {
        this.inputQueue = [];
    }

    addInput(inputType, data = {}) {
        this.inputQueue.push({
            type: inputType,
            timestamp: Date.now(),
            data,
        });
    }

    getAndRemoveInputs(inputType) {
        const removedInputs = [];
        let i = 0;
        while (i < this.inputQueue.length) {
            if (this.inputQueue[i].type === inputType) {
                removedInputs.push(...this.inputQueue.splice(i, 1));
            } else {
                i++;
            }
        }
        return removedInputs;
    }

    hasInput(inputType) {
        return this.inputQueue.some(input => input.type === inputType);
    }
}

export class ViewComponent {
    constructor(name) {
        this.name = name;
        this.template = '';
        this.logic = null;
    }

    async load() {
        try {
            // Load HTML template
            const htmlResponse = await fetch(`/views/${this.name}.html`);
            if (!htmlResponse.ok) {
                throw new Error(`Failed to load HTML for ${this.name}. Status: ${htmlResponse.status}`);
            }
            this.template = await htmlResponse.text();

            // Load JavaScript logic
            // const jsResponse = await fetch(`/views/${this.name}.js`);
            this.logic = await import(`/views/${this.name}.js`);
            if (typeof this.logic.init !== 'function' || typeof this.logic.render !== 'function') {
                throw new Error(`View ${this.name} must export init and render functions`, this.logic);
            }
        } catch (error) {
            console.error(`Error loading view ${this.name}:`, error);
        }
    }

    init(systemManager, entity) {
        if (this.logic && typeof this.logic.init === 'function') {
            this.logic.init(systemManager, entity);
        }
    }

    render(entity) {
        if (this.logic && typeof this.logic.render === 'function') {
            this.logic.render(entity);
        }
    }
}