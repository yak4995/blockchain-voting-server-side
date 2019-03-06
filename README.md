BCVS:
=====================
О приложении:
=====================
Представляет собой серверную (peer) часть для системы блокчейн-выборов. Серверная часть ставиться на одну и более площадок, которые выступают пирами (равные сервера peer-to-peer). Но один из серверов является мастер-сервером, куда клиент публикует выборы и через которые допущенные избиратели могут регистрироваться на них. Также на мастер-сервере начинаются выборы. А вот публиковать и менять голоса можно на любом пире. В список знакомых серверов для каждого пира в базе нужно добавлять вручную, по ним распостраняются блоки.
Система универсальна, потому что создание выборов/голосований/петиций происходит на клиенте, так же как и верификация допущенных избирателей, соответственно, система может применяться в очень многих прикладных областях.
---
Написан на NestJS фреймворке.
Использует NodeJS для работы(deploy) билда, TypeScript компилятор/JS+TS linter/Jest для построения билда(build), MongoDB для базы (и Mongoose для работы), Redis для асинхронных очередей задач, Cron для запуска регулярных задач.

Команды:
=====================
npm run start - build + deploy
npm run format - запуск prettier
npm run lint - запуск линтера
npm run test - запуск unit-тестов
npm run start:debug - режим дебага
npm run test:cov - отчет о покрытии тестами приложения
npm run start:voting-check - консольная Cron-команда, которая отвечает за начало выборов

REST-API документация:
=====================
***/api***

Модули и их связи:
=====================
1. App - "точка входа" в приложение
2. Node - один из основных модулей, отвечает за работу с самим блокчейном
3. Crypto - отвечает за хеширование, ЭЦП и проверки с помощью RSA
4. Auth - отвечает за выдачу и валидацию токенов доступа
5. Axios - отвечает за внешние связи, как peer-to-peer, так и с клиентом
6. Logger - отвечает за логгирование сообщений и ошибок
7. Database - позволяет генерировать модели для работы с базой данных
8. Config - отвечает за конфигурацию приложения и среды, где оно развернуто
![Архитектура модулей приложения](https://github.com/yak4995/blockchain-voting-server-side/blob/master/BCVS-arch.png)

Уязвимости:
=====================
1. Доверие к внешним узлам 2-ого и 3-ого типа из-за невозможности хранения пар публичный-приватный ключ для выборов на каждом узле из-за невозможности свободного распостранении приватного ключа по сети
2. Открытые для владельца главного сервера база соотношений ключа и избирателя, что в теории может нарушить анонимность
3. Возможность поменять код на сервере втайне так, чтобы он не удалял соотношений ключа и избирателя или бекапил их или в других целях 
4. Очень долгий поиск по длинным цепочкам и долгое (превышающее http-таймауты) вычисление таким образом валидности всей цепочки и/или результатов больших выборов