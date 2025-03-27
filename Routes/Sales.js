const {
    CreateSales,
    GetAllSales ,
    GetSingleSales,
    DeleteSales,
    GetAllSalesLegers,
    GetAllSalesByPage,
    GetAllSalesLegersByPage,
    
    
} = require("../Controllers/Sales")
const express = require("express")

const router = express.Router()

router.post('/sales', CreateSales)

router.get("/sales",GetAllSales)

router.get("/salesbypage", GetAllSalesByPage )

router.get("/salesLegers",GetAllSalesLegers)

router.get("/salesLedgerbypage", GetAllSalesLegersByPage )

router.get("/sales/:Name",GetSingleSales,)

// router.put('/sales/:id', UpdateUser)

router.delete("/sales/:id",DeleteSales)



module.exports = router