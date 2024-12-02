import { Router } from 'express';
import { User } from '../models/User';
import { State } from '../models/State';
import { Referral } from '../models/Referral';
import { UserItem } from '../models/UserItem';
import { Item } from '../models/Item';
import { ConfigRow } from '../models/ConfigRow';

const router = Router();

router.post('/user', async (req, res) => {
    const { userData, inviterId }: { userData: User, inviterId: string } = req.body;
    try {
        let user;
        let state: State | null;
        const result = await User.createQueryBuilder()
            .insert()
            .values(userData)
            .orIgnore()
            .returning("*")
            .execute();
        if (result.raw.length > 0) {
            user = result.raw[0];
            state = State.create();
            state.id = user.id;
            if (inviterId && inviterId != user.id) {
                const referral = Referral.create();
                referral.inviterId = inviterId;
                referral.userId = user.id;
                referral.username = user.username;
                referral.bonus = user.is_premium ? 25000 : 5000;
                state.coins = 5000;
                state.all_coins = 5000;
                referral.status = 'accepted';
                await referral.save();
            }
            await state.save();
        } else {
            user = await User.findOne({ where: { id: userData.id } });
            state = await State.findOne({ where: { id: userData.id } });
        }
        console.log('User updated:', user);
        return res.status(200).json({ message: "User data saved successfully", user, state });
    } catch (error) {
        console.error(`Error saving user: ${userData}`, error);
        return res.status(500).json({ message: "Error saving user data" });
    }
});

router.post('/state', async (req, res) => {
    const stateData: State = req.body;
    try {
        const state = await State.findOne({ where: { id: stateData.id } })
        if (state) {
            state.coins = stateData.coins;
            state.all_coins = stateData.all_coins;
            state.timer = stateData.timer;
            state.shkiper_counter = stateData.shkiper_counter;
            state.shkiper_timer = stateData.shkiper_timer;
            state.days_counter = stateData.days_counter;
            state.days_claimed = stateData.days_claimed;
            state.referrals_claimed = stateData.referrals_claimed;
            state.previous_day = stateData.previous_day;
            if (stateData.code_error) {
                state.code_error = new Date(stateData.code_error);
            }

            state.save();
        }
        return res.status(200).json({ message: "State data saved successfully" });
    } catch (error) {
        console.error(`Error saving user: ${stateData}`, error);
        return res.status(500).json({ message: "Error saving user data" });
    }
});

router.get('/:userId/items', async (req, res) => {
    try {
        const userId = req.params.userId;
        const items = await Item.createQueryBuilder("item")
            .leftJoinAndSelect("item.userItems", "userItem", "userItem.user_id = :userId", { userId })
            .orderBy("item.id", "ASC")
            .getMany();

        if (items) {
            res.json(items);
        } else {
            res.status(404).json({ error: 'Items not found' });
        }
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: 'Error fetching items' });
    }
});

router.post('/:userId/items/upgrade/:itemId', async (req, res) => {
    const userId = req.params.userId;
    const itemId = parseInt(req.params.itemId);
    try {
        let userItem = await UserItem
            .createQueryBuilder("userItem")
            .innerJoinAndSelect("userItem.item", "item")
            .where("userItem.user_id = :userId")
            .andWhere("userItem.item_id = :itemId")
            .setParameters({ userId, itemId })
            .getOne();

        if (!userItem) {
            const item = await Item.findOne({ where: { id: itemId } });
            if (!item) {
                console.log(`Item not found for itemId: ${itemId}`);
                return res.status(404).json({ error: 'Item not found' });
            }
            userItem = UserItem.create();
            userItem.user_id = userId;
            userItem.item_id = item.id;
            userItem.level = 1;
            userItem.item = item;
        }

        if (userItem) {
            const state = await State.findOne({ where: { id: userItem.user_id } });
            const price = Math.round(userItem.item.cost * Math.pow(1.50, userItem.level - 1));
            if (state && state.coins >= price) {
                userItem.level += 1;
                await userItem.save();
            }
            res.status(200).json({ message: 'Monster upgraded successfully', userItem });
        } else {
            res.status(404).json({ error: 'UserItem not found' });
        }


    } catch (error) {
        console.error('Error of upgrading a monster:', error);
        res.status(500).json({ error: 'Error of upgrading a monster' });
    }
});

router.get('/:userId/referrals', async (req, res) => {
    const userId = req.params.userId;

    try {
        const referrals = await Referral.find({
            where: { inviterId: userId }
        });
        const updatedReferrals = await Promise.all(referrals.map(async (referral) => {
            const state = await State.findOne({ where: { id: referral.userId } });
            return {
                ...referral,
                coins: state ? state.coins : 0,
                all_coins: state ? state.all_coins : 0
            };
        }));

        // Send the updated referrals as the response
        res.json(updatedReferrals);
    } catch (error) {
        console.error('Error fetching referrals:', error);
        res.status(500).send('Error fetching referrals');
    }
});

router.post('/:userId/claim', async (req, res) => {
    const userId = req.params.userId;
    const { referralId } = req.body;
    try {
        const referral = await Referral.findOne({ where: { inviterId: userId, id: referralId } });
        if (!referral) {
            throw new Error('Referral not found');
        }
        const bonusToClaim = referral.bonus;
        referral.bonus = 0;
        referral.status = 'claimed';
        await referral.save();
        res.json(bonusToClaim);
    } catch (error) {
        console.error('Error claiming bonus:', error);
        res.status(500).send(`Error claiming bonus: ${error}`);
    }
});

router.get('/config', async (req, res) => {
    try {
        // Fetch the config row
        let configRecord = await ConfigRow.findOne({ where: {} });

        // If no config record is found, create a default one
        if (!configRecord) {
            configRecord = ConfigRow.create({
                bonus_code: generate4DigitCode(),
            });
            await configRecord.save();
            console.log(`Config created. With code ${configRecord.bonus_code}`);
        }

        // Respond with the current bonus code and last updated time
        res.json(configRecord);

    } catch (error) {
        console.error('Error fetching or updating the bonus code:', error);
        res.status(500).send(`Error: ${error}`);
    }
});

// Function to generate a 4-digit code
function generate4DigitCode() {
    return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a 4-digit number as a string
}

router.post('/:userId/claim-code', async (req, res) => {
    const userId = req.params.userId;
    const { code } = req.body;

    try {
        // Fetch the State associated with the user
        const state = await State.findOne({ where: { id: userId } });
        if (!state) {
            throw new Error('State not found for the given user.');
        }

        // Check if the code is valid
        const config = await ConfigRow.findOne({ where: {} });
        if (!config) {
            throw new Error('Config not found.');
        }

        // Check if the code matches the current config code
        console.log(`Code received: ${code} and code on server is ${config.bonus_code}`);
        if (config.bonus_code !== code) {
            return res.status(400).send('Invalid code.');
        }

        // Check if the code was already used by the user
        const usedCodes = state.used_codes ? state.used_codes.split(',') : [];
        if (usedCodes.includes(code)) {
            return res.status(400).send('Code has already been used.');
        }

        // Add the code to the used codes list
        usedCodes.push(code);
        state.used_codes = usedCodes.join(',');
        await state.save();

        res.json({
            message: 'Code claimed successfully!',
            coins: 5000
        });
    } catch (error) {
        console.error('Error claiming code:', error);
        res.status(500).send(`Error claiming code`);
    }
});

router.post('/:userId/claim-league', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Fetch the State associated with the user
        const state = await State.findOne({ where: { id: userId } });
        if (!state) {
            throw new Error('State not found for the given user.');
        }
        state.league_claimed++;
        await state.save();

        res.json({
            message: 'League claimed successfully!',
            coins: 2000
        });
    } catch (error) {
        console.error('Error claiming league:', error);
        res.status(500).send(`Error claiming league`);
    }
});

export default router;