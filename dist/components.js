export class CoinsComponent {
    constructor(amount = 0, all_amount = 0) {
        this.amount = amount;
        this.all_amount = all_amount;
    }
}

export class PassiveIncomeComponent {
    constructor(items) {
        this.calculate(items);
    }

    calculate(items) {
        this.incomePerHour = 100;
        for (const item of items) {
            const level = item.userItems && item.userItems.length > 0 ? item.userItems[0].level : 1;
            const bonus = level == 1 ? 0 : Math.round(item.passive_bonus * Math.pow(1.50, level - 1));
            this.incomePerHour += bonus;
        }
    }
}

export class TimerComponent {
    constructor(timer) {
        this.timer = timer;
    }
}

export class TasksComponent {
    constructor(daysCounter, daysClaimed, referralsClaimed) {
        this.daysCounter = daysCounter;
        this.daysClaimed = daysClaimed;
        this.referralsClaimed = referralsClaimed;
    }
}

export class CodeComponent {
    constructor(code, codeUpdated) {
        this.code = code;
        this.codeUpdated = codeUpdated;
    }
}

export class ShkiperComponent {
    constructor(counter, timer) {
        this.counter = counter;
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

export class ItemsComponent {
    constructor(items) {
        this.items = items;
    }
}

export class ReferralsComponent {
    constructor(items) {
        this.items = items;

    }
}

export class WalletComponent {
    constructor() {
        this.wallet = null;
    }

    getWallet() {
        if (!this.wallet) {
            try {
                console.log(`Trying to init ton wallet`);
                const walletUI = new TON_CONNECT_UI.TonConnectUI({
                    manifestUrl: 'https://yoho-webapp.com/tonconnect-manifest.json',
                    buttonRootId: 'ton-connect'
                });
                console.log(`Wallet object is: ${walletUI}`);
                // Fix: use this.wallet instead of tonConnectUI
                walletUI.uiOptions = {
                    twaReturnUrl: 'https://t.me/yoho_nw_bot/YOHO'
                };
                walletUI.onStatusChange(async (wallet) => {
                    if (wallet) {
                        console.log("Wallet connected:", wallet.account);
                    } else {
                        console.log("Wallet disconnected");
                    }
                });
                this.wallet = walletUI;
            } catch (error) {
                console.error('Failed initializing wallet:', error);
            }
        }

        return this.wallet;
    }
}

export class LeagueComponent {
    leagues = ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND']
    constructor(leagueGoal = 5000, leagueClaimed) {
        this.leagueGoal = leagueGoal;
        this.leagueClaimed = leagueClaimed;
    }

    getCurrentLeague(allCoins) {
        console.log(`Trying to get league with coins: ${allCoins} and goal: ${this.leagueGoal}`)
        let leagueIndex = Math.floor(allCoins / this.leagueGoal);

        // Ensure the league index doesn't go beyond the max index of leagues array
        if (leagueIndex >= this.leagues.length) {
            leagueIndex = this.leagues.length - 1;
        }

        return this.leagues[leagueIndex];
    }

    getLeagueIndex(allCoins) {
        return Math.floor(allCoins / this.leagueGoal);
    }

    getLeagueValue(allCoins) {
        return allCoins % this.leagueGoal;
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