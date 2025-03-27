const {
    CreateUser,
    GetAllUser,
    GetSingleUser,
    UpdateUser,
    DeleteUser
    
} = require("../Controllers/User")
const express = require("express")

const router = express.Router()

router.post('/user', CreateUser)

router.get("/user",GetAllUser)

router.get("/user/:Name",GetSingleUser)

router.put('/user/:id', UpdateUser)

router.delete("/user/:id",DeleteUser)



module.exports = router