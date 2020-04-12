import express from "express"
import { Application } from "express"
import { Server } from "typescript-rest"
import { AuthorizationController } from './controllers/authorization'

let app: Application = express()
Server.buildServices(app, AuthorizationController)

app.listen(3000, function() {
    console.log('Started Access Point Client on port 3000')
})
