# Chatter
![CircleCI](https://img.shields.io/circleci/build/github/DiegoVictor/chatter?style=flat-square&logo=circleci)
[![eslint](https://img.shields.io/badge/eslint-7.24.0-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![airbnb-style](https://flat.badgen.net/badge/style-guide/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![jest](https://img.shields.io/badge/jest-26.6.3-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![coverage](https://img.shields.io/codecov/c/gh/DiegoVictor/chatter?logo=codecov&style=flat-square)](https://codecov.io/gh/DiegoVictor/chatter)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://github.com/DiegoVictor/bethehero-api/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)<br>
[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=Chatter&uri=https%3A%2F%2Fraw.githubusercontent.com%2FDiegoVictor%2Fchatter%2Fmaster%2FInsomnia_2021-04-24.json)

Permit to register users and its settings, also manage websocket connections and messages. The app has friendly errors, validation, also a simple versioning was made.

## Table of Contents
* [Installing](#installing)
  * [Configuring](#configuring)
    * [SQLite](#sqlite)
      * [Migrations](#migrations)
    * [.env](#env)
* [Usage](#usage)
  * [Error Handling](#error-handling)
    * [Errors Reference](#errors-reference)
  * [Versioning](#versioning)
  * [Routes](#routes)
    * [Requests](#requests)
* [Running the tests](#running-the-tests)
  * [Coverage report](#coverage-report)

# Installing
Easy peasy lemon squeezy:
```
$ yarn
```
Or:
```
$ npm install
```
> Was installed and configured the [`eslint`](https://eslint.org/) and [`prettier`](https://prettier.io/) to keep the code clean and patterned.

## Configuring
The application use just one database: [SQLite](https://www.sqlite.org/index.html).

### SQLite
Store the users, settings, messages and connections. For more information to how to setup your database see:
* [typeorm](https://typeorm.io/#/using-ormconfig)
> You can find the application's `ormconfig.js` file in the root folder.

#### Migrations
Remember to run the database migrations:
```
$ yarn ts-node-dev ./node_modules/typeorm/cli.js migration:run
```
Or:
```
$ yarn typeorm migration:run
```
> See more information on [TypeORM Migrations](https://typeorm.io/#/migrations).

### .env
In this file you may configure your Redis database connection, JWT settings, the environment, app's port and a url to documentation (this will be returned with error responses, see [error section](#error-handling)). Rename the `.env.example` in the root directory to `.env` then just update with your settings.

|key|description|default
|---|---|---
|PORT|Port number where the app will run.|`3333`
|DOCS_URL|An url to docs where users can find more information about the app's internal code errors.|`https://github.com/DiegoVictor/chatter#errors-reference`

# Usage
To start up the app run:
```
$ yarn dev:server
```
Or:
```
npm run dev:server
```

## Error Handling
Instead of only throw a simple message and HTTP Status Code this API return friendly errors:
```json
{
  "statusCode": 400,
  "error": "BadRequest",
  "message": "Setting already exists",
  "code": 140,
  "docs": "https://github.com/DiegoVictor/chatter#errors-reference"
}
```
> Errors are implemented with [@hapi/boom](https://github.com/hapijs/boom).
> As you can see a url to error docs are returned too. To configure this url update the `DOCS_URL` key from `.env` file.
> In the next sub section ([Errors Reference](#errors-reference)) you can see the errors `code` description.

### Errors Reference
|code|message|description
|---|---|---
|140|Setting already exists|Already exists a settings to provided `username`.
|144|Setting not found|The provided `username` not references an existing setting in the database.
|244|User not found|The user `id` sent does not references an existing user in the database.
|245|User not found|Is not possible to retrieve messages from a user not found in the database.

## Versioning
A simple versioning was made. Just remember to set after the `host` the `/v1/` string to your requests.
```
POST http://localhost:3333/v1/settings
```

## Routes
|route|HTTP Method|params|description
|:---|:---:|:---:|:---:|:---:|:---:
|`/settings/:username`|GET|`username` of the user.|Return the user's setting.
|`/settings`|POST|Body with settings data.|Create new setting.
|`/settings/:username`|PUT|`username` of the user and body with `chat` new value.|Update an user's setting.
|`/users`|POST|Body with user's `email`.|Create a new user.
|`/users/:user_id/messages`|GET|`id` of the user.|Return user's messages.
|`/messages`|POST|Body with message data.|Return user's messages.


> Routes with `Bearer` as auth method expect an `Authorization` header. See [Bearer Token](#bearer-token) section for more information.

### Requests
* `POST /settings`

Request body:
```json
{
  "username": "johndoe",
  "chat": true
}
```

* `PUT /settings/:username`

Request body:
```json
{
  "chat": true
}
```

* `POST /users`

Request body:
```json
{
  "title": "johndoe@example.com"
}
```

* `POST /messages`

Request body:
```json
{
  "user_id": "d01bc88b-15cb-4478-830f-edc44577d707",
  "admin_id": null,
  "text": "Lorem ipsum doolor sit amet"
}
```

# Running the tests
[Jest](https://jestjs.io/) was the choice to test the app, to run:
```
$ yarn test
```
Or:
```
$ npm run test
```

## Coverage report
You can see the coverage report inside `tests/coverage`. They are automatically created after the tests run.
