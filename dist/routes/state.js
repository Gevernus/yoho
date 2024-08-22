"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const State_1 = require("../models/State");
const router = (0, express_1.Router)();
router.post('/user', async (req, res) => {
    const { userData, inviterId } = req.body;
    try {
        let user;
        let state;
        const result = await User_1.User.createQueryBuilder()
            .insert()
            .values(userData)
            .orIgnore()
            .returning("*")
            .execute();
        if (result.raw.length > 0) {
            user = result.raw[0];
            state = State_1.State.create();
            state.id = user.id;
            await state.save();
        }
        else {
            user = await User_1.User.findOne({ where: { id: userData.id } });
            state = await State_1.State.findOne({ where: { id: userData.id } });
        }
        console.log('User updated:', user);
        return res.status(200).json({ message: "User data saved successfully", user, state });
    }
    catch (error) {
        console.error(`Error saving user: ${userData}`, error);
        return res.status(500).json({ message: "Error saving user data" });
    }
});
router.get('/:userId/calculate_passive', async (req, res) => {
    const userId = req.params.userId;
    try {
        const state = await State_1.State.findOne({ where: { id: userId } });
        let passive_income = 0;
        let shouldShowPopup = false;
        let energyRestored = 0;
        if (state) {
            const now = new Date();
            const lastUpdated = new Date(state.last_updated);
            const timeDiffInSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
            const maxAccumulationTime = Math.min(timeDiffInSeconds, 3 * 60 * 60);
            passive_income = Math.floor(state.passive_income / 3600 * maxAccumulationTime);
            energyRestored = state.energy_restore * timeDiffInSeconds;
            shouldShowPopup = timeDiffInSeconds > 300 && passive_income > 0;
            console.log(`Time since last update in sec: ${timeDiffInSeconds}, should show popup: ${shouldShowPopup}`);
        }
        return res.status(200).json({ passive_income, shouldShowPopup, energyRestored });
    }
    catch (error) {
        console.error(`Error calculating of passive income for: ${userId}`, error);
        return res.status(500).json({ message: "Error calculating passive income" });
    }
});
router.post('/state', async (req, res) => {
    const stateData = req.body;
    try {
        const state = await State_1.State.findOne({ where: { id: stateData.id } });
        if (state) {
            state.coins = stateData.coins;
            state.energy = stateData.energy;
            state.tap_power = stateData.tap_power;
            state.passive_income = stateData.passive_income;
            state.level = stateData.level;
            state.save();
        }
        return res.status(200).json({ message: "State data saved successfully" });
    }
    catch (error) {
        console.error(`Error saving user: ${stateData}`, error);
        return res.status(500).json({ message: "Error saving user data" });
    }
});
exports.default = router;
//# sourceMappingURL=state.js.map