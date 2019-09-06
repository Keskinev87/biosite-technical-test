import * as Router from 'koa-router';
import { createUsersRouter } from './users';


export function createApiRouter() {
    const router = new Router();

    router.use('/users', createUsersRouter().routes());

    router.get('/test', async (ctx) => {
        ctx.body = {
            status: 'ok',
        };
    });

    return router;
}
