export const tempRouter = require('express').Router();

tempRouter.get('/', async (request: any, response: any) => {
  response.status(200).send('Welcome to MUJIK');
});

// module.exports = tempRouter;