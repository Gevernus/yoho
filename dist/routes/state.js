"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const State_1 = require("../models/State");
const Referral_1 = require("../models/Referral");
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
            if (inviterId && inviterId != user.id) {
                const referral = Referral_1.Referral.create();
                referral.inviterId = inviterId;
                referral.userId = user.id;
                referral.username = user.username;
                referral.bonus = 10;
                referral.status = 'accepted';
                await referral.save();
            }
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
router.post('/state', async (req, res) => {
    const stateData = req.body;
    try {
        const state = await State_1.State.findOne({ where: { id: stateData.id } });
        if (state) {
            state.coins = stateData.coins;
            state.timer = stateData.timer;
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