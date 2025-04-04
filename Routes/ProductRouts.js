const {
    CreateProducts,
    CreateBranch,
    upload,
    GetAllProducts,
    GetAllBranch,
    GetProductsByPage,
    UpdateProductsQty,
    UpdateProductsSales,
    DeleteRecord,
    UpdateproductImage,
    SearchProducts
    
} = require("../Controllers/Products")
const express = require("express")

const router = express.Router()

router.post('/products',upload.single('image'), CreateProducts)

router.post("/branch",CreateBranch)

router.get('/products', GetAllProducts)

router.get('/productpage', GetProductsByPage)

router.get("/branch",GetAllBranch)

router.put("/ProQty/:id", UpdateProductsQty)

router.put("/ProQtySales/:Name", UpdateProductsSales)

router.put("/productsimg",upload.single('image'), UpdateproductImage)

router.get('/Prosearch/:search', SearchProducts);


router.delete("/products/:id",DeleteRecord)


module.exports = router