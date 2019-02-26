import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Если нас не устраивает стандартный AuthGuard, мы можем унаследовать и переопределить его
// Как и любой AuthGuard-класс должен реализовывать canActivate метод
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Возвращает логическое значение, пускать ли запрос или отклонить. Если отклонить, Nest игнорирует запрос
  // На самом деле guard, который возвращает ложные значения, выдает HttpException
  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    // он, видимо, подпись на JWT и проверяет
    return super.canActivate(context);
  }

  // обрабатывет результат canActivate, например не выкидывать 401, даже если юзер неаутентифицирован
  // если вернуть user в любом случае (без exception-ов), то с невалидным токеном можно будет получить инфу
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
