import { Router } from 'express';
import { bot } from '../app';

const router = Router();

router.post('/telegram', async (req, res) => {
    const update = req.body;
    console.log(update);
    try {
        if (update.pre_checkout_query) {
            // Handle pre_checkout_query
            await handlePreCheckoutQuery(update.pre_checkout_query);
            console.log('pre_checkout_query answered');
            res.sendStatus(200);
        } else if (update.message && update.message.successful_payment) {
            console.log('successful_payment about to call');
            // Handle successful payment
            await handleSuccessfulPayment(update.message);
            res.sendStatus(200);
        } else {
            // Handle other types of updates if needed
            console.log('Received update:', update);
            res.sendStatus(200);
        }
    } catch (error) {
        console.error('Error handling Telegram update:', error);
        res.sendStatus(500);
    }
});

async function handlePreCheckoutQuery(query: { id: string; }) {
    try {
        await bot.api.answerPreCheckoutQuery(query.id, true);
        console.log('Pre-checkout query answered successfully', query);
    } catch (error) {
        console.error('Error answering pre-checkout query:', error);
        throw error;
    }
}

async function handleSuccessfulPayment(message: { successful_payment: { invoice_payload: string; }; }) {
    
}

export default router;