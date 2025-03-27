const { Sales, SalesLedger, SalesBranch } = require("../Models/Sales");
const {Branch} = require("../Models/ProductsModel")
const multer = require("multer");
const fs = require("fs");
const path = require("path");

async function deleteTable() {
  try {
    await SalesBranch.drop();
    console.log("Table deleted successfully.");
  } catch (error) {
    console.error("Error deleting table:", error);
  }
}

const CreateSales = async (req, res) => {
  const { Name, Contact, Items, TotalAmount, SoldBy, branchName } = req.body;

  try {
    let sales;

    const salesRecords = await Sales.findAll();

    if (salesRecords.length === 0) {
      sales = await Sales.create({
        
          TotalSales:1,
          LastSale:TotalAmount,
          TotalSalesRevnue:TotalAmount,
          LastSalesPerson:SoldBy,

    });
    }
    else{
        const lastRecord = await Sales.findOne({
            order: [['id', 'DESC']],
          });
      sales= await Sales.create({
            TotalSales:lastRecord.TotalSales + 1,
            LastSale:TotalAmount,
            TotalSalesRevnue:lastRecord.TotalSalesRevnue + TotalAmount,
            LastSalesPerson:SoldBy,
    });
    }

    const [branch, branchCreated] = await Branch.findOrCreate({
      where: { BranchName: branchName },
    });

    const [salesBranch, salesBranchCreated] = await SalesBranch.findOrCreate({
      where: {SaleId:sales.id,  BranchId: branch.id },
      defaults: {
        TotalSales: 0,
        LastSales: 0,
        TotalAmount: 0,
      },
    });

    await salesBranch.update(
      {
        TotalSales: salesBranch.TotalSales + 1,
        LastSales: TotalAmount,
        TotalAmount:salesBranch.TotalAmount + TotalAmount
      },
      { where: { id: salesBranch.id } }
    );  

    SalesLedger.create({
      Date: sales.createdAt,
      CustomersContact: Contact,
      CustomersName:Name,
      ItemsBought:Items,
      AmountPaid:TotalAmount,
      SoldBy,
      SaleId:sales.id,
      BranchId: branch.id,
    });

    res.status(200).json(sales );
  } catch (error) {
    res.status(400).json({ error: error.message});
  }
};

const GetAllSales = async (req, res) => {
  try {
    const branch = await Sales.findAll({
      include: [
        {
          model: Branch,
          // through: { attributes: ["quantity"] }, // Include the quantity from ProductLocation
          include: [
            {
              model: SalesLedger,
              // You can add conditions here if needed
            },
          ],
        },
        {
          model: SalesLedger,
          // You can add separate conditions for product-specific ledger entries
        },
      ],
      order: [["createdAt", "DESC"]],
    }).then((result) => {
      res.status(200).json(result);
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
  
};

const GetAllSalesByPage = async (req, res) => {
  const PageNo = Number.parseInt(req.query.page)
    const sizeNo = Number.parseInt(req.query.size)

    let page = 0

    if(!Number.isNaN(PageNo) && PageNo > 0){
        page =PageNo
    }

    let size =5
    if(!Number.isNaN(sizeNo) && sizeNo > 0 && sizeNo < 500){
        size = sizeNo
    }

  try {
    const branch = await Sales.findAndCountAll({
      order: [["createdAt", "DESC"]],
     // This replaces the reverse() method
        limit:size,
        offset:page *size
    }).then((result) => {
      res.status(200).json(result.rows);
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const GetAllSalesLegers = async (req, res) => {
  try {
    const branch = await SalesLedger.findAll({
      order: [["createdAt", "DESC"]],
    }).then((result) => {
      res.status(200).json(result);
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const GetAllSalesLegersByPage = async (req, res) => {
  const PageNo = Number.parseInt(req.query.page)
    const sizeNo = Number.parseInt(req.query.size)

    let page = 0

    if(!Number.isNaN(PageNo) && PageNo > 0){
        page =PageNo
    }

    let size =5
    if(!Number.isNaN(sizeNo) && sizeNo > 0 && sizeNo < 500){
        size = sizeNo
    }

  try {
    const branch = await SalesLedger.findAndCountAll({
      order: [["createdAt", "DESC"]],
     // This replaces the reverse() method
        limit:size,
        offset:page *size
    }).then((result) => {
      res.status(200).json(result.rows);
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const GetSingleSales = async (req, res) => {
  const BranchId = req.params.id;

  try {
    const Getone = await Sales.findOne({ where: { id: BranchId } }).then(
      (result) => {
        res.status(200).json({ result });
      }
    );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const DeleteSales = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await Sales.destroy({
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
  CreateSales,
  GetAllSales,
  GetSingleSales,
  DeleteSales,
  GetAllSalesLegers,
  GetAllSalesByPage ,
  GetAllSalesLegersByPage
};
