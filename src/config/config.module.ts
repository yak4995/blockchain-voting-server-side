import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({
  providers: [
    {
      //Когда нужно будет инжектить значение класса (или по ключу), указанное ниже
      provide: ConfigService,
      /*
        Синтаксис useValue полезен, когда необходимо определить константу,
        поместить внешнюю библиотеку в контейнер Nest или заменить реальную реализацию фиктивным объектом.
        означает, что когда Nest будет инжектить значение класса ConfigService, он будет использовать значение ниже
      */
      useValue: new ConfigService(`${process.env.NODE_ENV}.env`),
      //А вот если надо подменить класс при инжекции, в зависимости от внешних факторов, вместо useValue делают так:
      /*
        useClass: process.env.NODE_ENV === 'development'
          ? DevelopmentConfigService
          : ProductionConfigService
      */
      //А если надо сгенерировать провайдер динамически, вместо useValue используют useFactory и inject
    },
  ],
  //модули, которые будут импортировать ConfigModule, смогут инжектить ConfigService в своих классах
  exports: [ConfigService],
})
export class ConfigModule {}