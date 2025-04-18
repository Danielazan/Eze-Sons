const { Product,ProductLedger, Branch, ProductBranch } = require("../Models/ProductsModel");
const { Op } = require('sequelize');
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

async function deleteTable() {
    try {
      await ProductLedger.drop();
      console.log("Table deleted successfully.");
    } catch (error) {
      console.error("Error deleting table:", error);
    }
  }

// const AddProducts = async (req, res) => {
//   const image = req.file;

//   const { Name, Quantity, Previous_Qty, NewQtyAdded,BranchName } = req.body;

//   try {
//     if (!image) {
//       const error = new Error("Please upload a file");
//       error.status = 400;
//       throw error;
//     }
//     console.log(image);

//     const products = await Product.create({
//       Name,
//       Quantity,
//       Previous_Qty: 0,
//       NewQtyAdded: Quantity,
//       ImagePath: image.filename,
//       BranchName:BranchName
//     }).then((result) => {
//       res.status(200).json(result);
//       return result;
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

const CreateProducts = async (req, res) => {
    const image = req.file;

    const { Name, Quantity,branchName} = req.body;

    console.log({ Name, Quantity,branchName})
  
    try {

        if (!image) {
                  const error = new Error("Please upload a file");
                  error.status = 400;
                  throw error;
                }
                console.log(image);
        
      const [product, created] = await Product.findOrCreate({
        where: { Name },
        defaults: {
          Name,
          Quantity,
          Previous_Qty: 0,
          NewQtyAdded: Quantity,
          ImagePath: image.filename,
          TotalQuantity: Quantity
        },
      });

      const [branch, branchCreated] = await Branch.findOrCreate({
        where: { BranchName: branchName },
      });

      const [productBranch, productBranchCreated] =
      await ProductBranch.findOrCreate({
        where: { ProductId: product.id, BranchId: branch.id },
        defaults: {
            quantity:0,
            QtyRem:0,
              QtySold:0,
              AmountInCash:0
        },
      });

      await productBranch.update(
        {
          quantity: Quantity,
          QtyRem: productBranch.QtyRem + Number(Quantity),
        },
        { where: { id: productBranch.id } }
      );  

      ProductLedger.create({
            Date:product.createdAt,
          QtyIn:Quantity,
          QtyOut:0,
          Balance:productBranch.QtyRem,
          ProductId: product.id,
          BranchId: branch.id,
      });
  
      res.status(200).json({ product, created });
    } catch (error) {
      console.error("Error in findOrCreate:", error);
      res
        .status(500)
        .json({ error: error.message });
    }
  };

  const CreateBranch = async (req, res) => {
    const { Name } = req.body;
  
    try {
        const [Location, created] = await Branch.findOrCreate({
            where: { BranchName:Name },
            defaults: {
                BranchName:Name,
            },
          });
      
          res.status(200).json({ Location, created });
        } catch (error) {
          console.error("Error in findOrCreate:", error);
          res
            .status(500)
            .json({ error: error.message });
        }
  };

  const GetAllProducts = async (req, res) => {

    try {
      const products = await Product.findAndCountAll({
        include: [
          {
            model: Branch,
            // through: { attributes: ["quantity"] }, // Include the quantity from ProductLocation
            include: [
              {
                model: ProductLedger,
                // You can add conditions here if needed
              },
            ],
          },
          {
            model: ProductLedger,
            // You can add separate conditions for product-specific ledger entries
          },
        ],
        order: [["createdAt", "DESC"]], // This replaces 
      });
  
      res.status(200).json(products.rows);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  const GetProductsByPage = async (req, res) => {
    const PageNo = Number.parseInt(req.query.page)
    const sizeNo = Number.parseInt(req.query.size)

    let page = 0

    if(!Number.isNaN(PageNo) && PageNo > 0){
        page =PageNo
    }

    let size =5
    if(!Number.isNaN(sizeNo) && sizeNo > 0 && sizeNo < 10){
        size = sizeNo
    }

    try {
      const products = await Product.findAndCountAll({
        include: [
          {
            model: Branch,
            // through: { attributes: ["quantity"] }, // Include the quantity from ProductLocation
            include: [
              {
                model: ProductLedger,
                // You can add conditions here if needed
              },
            ],
          },
          {
            model: ProductLedger,
            // You can add separate conditions for product-specific ledger entries
          },
        ],
        order: [["createdAt", "DESC"]], // This replaces the reverse() method
        limit:size,
        offset:page *size
      });
  
      res.status(200).json(products.rows);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  const SearchProducts = async (req, res) => {
    try {
      const search = req.params.search; 
  
      const PageNo = Number.parseInt(req.query.page)
      const sizeNo = Number.parseInt(req.query.size)
  
      let page = 0
  
      if(!Number.isNaN(PageNo) && PageNo > 0){
          page =PageNo
      }
  
      let size =5
      if(!Number.isNaN(sizeNo) && sizeNo > 0 && sizeNo < 400){
          size = sizeNo
      }
  
      const products = await Product.findAndCountAll({
        order: [["createdAt", "DESC"]],
  
        where: {
          Name: {
            [Op.like]: `%${search}%`
          }
        },
        // This replaces the reverse() method
        limit:size,
        offset:page *size
      });
  
      res.status(200).json(products.rows);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const UpdateProductsSales = async (req, res) => {
    const Name = req.params.Name;
  
    const {
      Location,
      DatePurchased,
      Quantity,
      Amount
    } = req.body;
  
    try {
      const Getone = await Product.findOne({ where: {  Name } });
  
      const location = await Branch.findOne({
        where: { BranchName: Location },
      });
  
      const [productBranch, productBranchCreated] =
        await ProductBranch.findOrCreate({
          where: { ProductId: Getone.id, BranchId: location.id },
          defaults: {
            quantity: 0,
            QtyRem: 0,
            QtySold: 0,
            AmountInCash: 0
          },
        });
  
  
      await productBranch.update(
        {
          quantity: productBranch.quantity - Number(Quantity),
          QtyRem: productBranch.QtyRem - Number(Quantity),
          QtySold:productBranch.QtySold + Number(Quantity),
          AmountInCash:productBranch.AmountInCash + Number(Amount)
        },
        { where: { id: productBranch.id } }
      );
  
      ProductLedger.create({
        Date: DatePurchased,
        QtyIn: 0,
        QtyOut: Quantity,
        Balance: productBranch.QtyRem,
        BranchId: location.id,
        ProductId: Getone.id,
        // Use ProductName from Getone
      });
  
      // console.log(">>>>>>>>>>>>>>>>>>>Product Name coming from sstock pruchase",ledger)
  
      Product.update(
        {
          TotalQuantity: Getone.TotalQuantity - Number(Quantity),
          Previous_Qty:Getone.TotalQuantity,
          Quantity:Getone.Quantity - Number(Quantity),
        },
        { where: { Name } }
      )
        .then(() => {
          res.status(200).json({ message: "Record updated successfully" });
        })
        .catch((dbError) => {
          res.status(500).json({ error: dbError.message });
        });
  
      // console.log(">>>>>>>>>>>>>>>>>>>Product Name coming from sstock pruchase",reload)
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const UpdateProductsQty= async (req, res) => {
    const id = req.params.id;
  
    const {
      branch,
      Quantity,
    } = req.body;
  
    try {
      const Getone = await Product.findOne({ where: { id } })

      await Getone.update(
        {
          TotalQuantity:Getone.TotalQuantity + Number(Quantity),
          Quantity: Getone.Quantity  + Number(Quantity),
          Previous_Qty:Getone.TotalQuantity,
          NewQtyAdded:Number(Quantity)
        },
        { where: { id: Getone.id } }
      )
  
      const branchs = await Branch.findOne({ where: { BranchName: branch } });
  
      
      const [productbranchs, productbranchsCreated] = await ProductBranch.findOrCreate({ 
        where: { ProductId: Getone.id, BranchId: branchs.id },
        defaults: {
          quantity:0,
          QtyRem:0,
          QtySold:0,
          AmountInCash:0
        },
      });
  
      
      
      await productbranchs.update(
        {
          QtyRem: Number(productbranchs.QtyRem) + Number(Quantity),
          quantity: productbranchs.quantity  + Number(Quantity),
        },
        {
          where: { id: productbranchs.id},
        }
      );
  
      // console.log(">>>>>>>>>>>>>>>>>>>Product Name coming from sstock pruchase",Name
  
      await ProductLedger.create({
        Date:Getone.createdAt,
        QtyIn:Quantity,
        QtyOut:0,
        Balance:productbranchs.QtyRem,
        ProductId: Getone.id,
        BranchId: branchs.id,
      })
      .then(() => {
          res.status(200).json(Getone);
        })
        .catch((dbError) => {
          res.status(500).json({ error: dbError.message });
        });
    } catch (error) {
      res.status(400).json({ error: error.message});
    }
  };

  const UpdateproductImage = async (req, res) => {
    const image = req.file;
    const { productid } = req.body;
  
    try {
      if (!image) {
        const error = new Error("Please upload a file");
        error.status = 400;
        throw error;
      }
  
      // Fetch the existing product to get the current image path
      const product = await Product.findOne({ where: { id: productid } });
  
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
  
      // Construct the full path to the existing image
      const oldImagePath = path.join(
        __dirname,
        "..",
        "public",
        "images",
        product.ImagePath
      );
  
      // Remove the old image file
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error("Error deleting the old image:", err);
          return res
            .status(500)
            .json({ error: "Failed to delete the old image" });
        }
  
        // Update the database with the new image path
        Product.update(
          { ImagePath: image.filename },
          { where: { id: productid } }
        )
          .then(() => {
            res.status(200).json({ message: "Record updated successfully" });
          })
          .catch((dbError) => {
            res.status(500).json({ error: dbError.message });
          });
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const GetAllBranch = async (req, res) => {
    try {
      const Cat = await Branch.findAll().then((result) => {
        res.status(200).json(result.reverse());
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const DeleteRecord = async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.destroy({
        where: { id },
        cascade: true,
      }).then((result) => {
        res.status(200).json({ message: "Record deleted successfully" });
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const DeleteBranch = async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Branch.destroy({
        where: { id },
        cascade: true,
      }).then((result) => {
        res.status(200).json({ message: "Record deleted successfully" });
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };



  module.exports = {
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
    SearchProducts ,
    DeleteBranch
  };