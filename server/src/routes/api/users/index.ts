import { Context } from 'koa';
import * as parseBody from 'koa-bodyparser';
import * as Router from 'koa-router';

import { commands } from './commands';
import { get } from './get';
import { list } from './list';


function detectJSON(ctx: Context) {
    return /^application\/(.*\+)?json(;.*)?$/i.test(ctx.request.headers['content-type']);
}


export function createUsersRouter() {
    const router = new Router();

    router.get('/', list());
    router.get('/:id', get());
    router.post('/commands', parseBody({detectJSON}), commands());

    return router;
}
