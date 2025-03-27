const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const sequelize = require('./database')
const path = require("path")

const products = require("./Routes/ProductRouts")
const Users = require("./Routes/User")
const Sales= require("./Routes/Sales")


require("dotenv").config()
app = express()

app.use(express.urlencoded({ extended: false }));
app.use(cors())
// app.use(helmet())
app.use(express.json())
app.use(express.static("public"))


app.use("/api",products)
app.use("/api",Users)
app.use("/api",Sales)

sequelize.sync().then(()=>{
    app.listen(process.env.PORT,(req,res)=>{
        console.log(`Listening at port ${process.env.PORT}`)
    })
})
