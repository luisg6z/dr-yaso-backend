import express from 'express';

export const volunteerController = (_req: express.Request, res: express.Response) => {
    res.json({ message: 'Hi from the volunteer controller' });
}