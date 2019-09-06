import { Middleware } from 'koa';
import { UserRepository } from '../../../services/user-repository.service';


export function list(): Middleware {
    return async (ctx, next) => {
        const users = ctx.injector.get(UserRepository);
        ctx.body = users.list();
    };
}
