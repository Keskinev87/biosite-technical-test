import { Middleware } from 'koa';
import { UserRepository } from '../../../services/user-repository.service';


export function get(): Middleware {
    return async (ctx, next) => {
        const users = ctx.injector.get(UserRepository);
        const user = users.get(ctx.params.id);

        if (user !== undefined) {
            ctx.body = user;
        }
        else {
            ctx.status = 404;
        }
    };
}
