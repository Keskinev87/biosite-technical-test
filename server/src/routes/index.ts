import * as Router from 'koa-router';
import { createApiRouter } from './api';


export function createRootRouter() {
    const router = new Router();

    router.use('/api', createApiRouter().routes());

    return router;
}
