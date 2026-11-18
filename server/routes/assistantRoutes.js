const express = require("express");
const optionalAuth = require("../middlewares/optionalAuth");
const { postChat, postClaim, postConfirmOrder, getConversation } = require("../controllers/assistantController");

const assistantRouter = express.Router();

// Searching and browsing by chat needs no account; the cart and checkout tools
// added in later phases do their own login checks.
assistantRouter.post("/chat", optionalAuth, postChat);
// Called by the page straight after login: attaches an anonymous conversation
// to the account and replays the cart action the shopper was blocked on.
assistantRouter.post("/claim", optionalAuth, postClaim);
// The only route that places an order from chat. Reached by the shopper
// pressing Confirm order on the summary card, never by the model.
assistantRouter.post("/confirm-order", optionalAuth, postConfirmOrder);
assistantRouter.get("/conversation/:id", optionalAuth, getConversation);

module.exports = assistantRouter;
