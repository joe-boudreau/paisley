import express from "express"
import { Application } from "express"
import { Server } from "typescript-rest"

let app: Application = express()
Server.buildServices(app)

app.listen(3000, function() {
    console.log('Started Access Point Client on port 3000')
})
