import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { NodeModule } from './nodes/node.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CryptoModule } from './crypto/crypto.module';
import { LoggerModule } from './logger/app-logger.module';
import { AxiosModule } from './axios/axios.module';

/*
  Файл test.env в корне предназначен как замена .env файла для тестов Jest
  Настройки Jest храняться в package.json
*/

/*
  Последовательность прохождения запроса:
  1) [Клиент]
  2) Middlewares (не имеет доступ к контексту - для общего логгирования и изменения запросов/ответов)
  3) Guards (имеет доступ к контексту - для авторизации)
  4) [Роутер, отображающий запрос на метод контроллера]
  5) Interceptors (имеет доступ к контексту - AOP:
      детальное логгированиие,
      доп. логика до/после метода контроллера,
      кеширование,
      трансформации Exception-ов и ответов)
  6) Exception filters (имеет доступ к контексту - перехват Exception-ов в системе для выдачи их пользователю в красивом виде)
  7) Pipes (не имеет доступ к контексту - валидация и трансформация запросов)
  8) [Метод контроллера]
*/

/*
  Модули используются для организации частей приложения
  (в NestJS модуль на вершине иерархии. Содержит в себе контроллеры и провайдеры,
  импортирует другие модули, а также может экспортировать себя для других или реэкспортировать импортированные модули)
*/
// Каждое Nest-приложение содержит минимум один модуль - корневой. И это как раз он
@Module({
  // Список импортированных модулей, которые экспортируют провайдеров, которые требуются в этом модуле
  imports: [
    AuthModule,
    /*
      MongooseModule нужно заимпортить в AppModule обязательно (с методом forRoot и переданым ему url подключения к базе),
      чтобы была возможность использовать его в остальных модулях.
      Mongoose сохраняет документы в коллекцию с названием класса документа (lowercase) + s
    */
    // Асинхронно создаёт экземпляр динамического (то есть заданного с параметрами при создании) модуля
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      // Это способ динамического создания провайдеров.
      /*
        Фактический провайдер будет равен возвращенному значению фабричной функции.
        Фабричная функция может зависеть от нескольких разных провайдеров или оставаться полностью независимой.
        Это означает, что фабрика может принимать аргументы, которые Nest зарезолвит и передаст в процессе создания экземпляра.
        Кроме того, эта функция может возвращать значение асинхронно.
      */
      // Результат этого callback-а пойдет как параметр forRootAsync, то есть MongooseModule.forRootAsync('uri')
      useFactory: async (configService: ConfigService) => ({
        // аналог return {uri: configService.get('MONGODB_URI')};
        uri: configService.get('MONGODB_URI'),
        useNewUrlParser: true,
      }),
      // в useFactory нужно будет инжектить ConfigService
      inject: [ConfigService],
    }),
    NodeModule,
    CryptoModule,
    AxiosModule,
    LoggerModule.forRoot('root.txt'),
  ],
  /*
    Сообщаем Nest-у, что такие провайдеры существуют, принадлежат этому модулю (вне модуля провайдеры существовать не могут)
    и могут быть заинжектированы в контроллерах этого модуля
    (если мы хотим расшарить провайдеры для модулей, которые импортнули этот,
    мы должны их перечислить в разделе exports этого модуля)
  */
  providers: [AppService],
  // Сообщаем Nest-у, что такие контроллеры существуют и содержаться в этом модуле (вне модуля контроллеры существовать не могут)
  controllers: [AppController],
})
export class AppModule {}
