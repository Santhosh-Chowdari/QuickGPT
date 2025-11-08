import Stripe from "stripe";
import Transcation from "../models/transaction.js";
import  User from '../models/user.js';

export const stripewebhooks = async(req,res)=>{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const sig = req.headers["stripe-signature"]
    let event;
    try{
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch(error){
        return response.status(400).send(`Webhook Error: ${error.message}`)
    }
    try{
        switch(event.type){
            case "payment_intent.succeeded":{
                const paymentIntent = event.data.objectl
                const sessionLIst = await stripe.checkout.sessions.list({
                    payment_intent: paymentIntent.id
                })
                const session = sessionLIst.data[0]
                const {transcationId, appId} = session.metadata;
                if(appId === 'QuickGPT'){
                    const transaction = await Transcation.findOne({_id: transcationId, isPaid: false})
                    //Update credits in user account
                    await User.updateOne({_id: transaction.userId}, {$inc: {credits: transaction.credits}})
                    //Update credit Payment status
                    transaction.isPaid = true;
                    await transaction.save();
                }else{
                    return res.json({recieved: true, message: "Ignored event: Invalid app"})
                }
                break;
            }
            default:
                console.log("Unhandled event type:", event.type)
                break;
        }
        res.json({recieved: true})
    }catch(error){
        console.error("Webhook processing error")
        res.status(500).send("Internal Server Error")
    }
}