# Forum Server Setup

How to get this bad boy to run

## Prerequisites

- Node.JS installed
- MySQL installed

## Setting up the database

Use the dump file in this directory [forum.sql](./forum.sql). Dump it into a schema of your choosing. It's got some data on it so feel free to dump structure only to start fresh.

## Setting up .env FILE

edit the [.env](./.env) file in this directory 

Set entries with `DB_` prefixes according to your database setup. `DB_SCHEMA` should be whatever schema you dumped the file into in the previous step.

`SESSION_KEY` is a random 64 byte AES key encoded in hex. It is used to encode session tokens. You can regenerate it if you want.

`SESSION_DURATION` is the number of minutes before the server will reject a session token

`PORT` is whatever port the server will be listening to requests from

Ignore `HOST_CLIENT` and `CLIENT_PATH`

## Starting the server

At this point, run the following commands to start the development environment

```sh
npm install
npm run start
```

If everything goes well. Server will output the following in the console

```
🚀 Server ready at http://localhost:4000
🤯 Documentation ready at http://localhost:4000/docs
```

## Building the server

Use the following command to build the typescript project

```sh
npm run build
```

When the build is finished, you can run the built server with

```sh
node build/index.js
```
