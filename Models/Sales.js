const {Model, DataTypes } = require("sequelize")
const {Branch} = require("./ProductsModel")
const sequelize = require("../database")

class  Sales extends Model{}


 Sales.init({
      TotalSales: {
        type:DataTypes.INTEGER,
        allowNull: false
      },
      LastSale: {
        type:DataTypes.INTEGER,
        allowNull: false
      },
      TotalSalesRevnue:{
        type:DataTypes.INTEGER,
        allowNull:false
      },
      LastSalesPerson:{
        type: DataTypes.STRING,
        allowNull:false
      }
    }, {
      sequelize, // Pass the sequelize instance
      modelName: 'Sales' // Set the model name
    });

    class SalesBranch extends Model {}

    SalesBranch.init(
      {
        TotalSales: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        
        LastSales: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
   
        TotalAmount: {
          type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
        
      },
      {
        sequelize,
        modelName: "SalesBranch",
      }
    );

    class SalesLedger extends Model {}
    SalesLedger.init(
      {
        Date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
        CustomersName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        
        CustomersContact: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        ItemsBought: {
        type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },

        AmountPaid: {
          type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          SoldBy: {
            type: DataTypes.INTEGER,
              allowNull: false,
              defaultValue: 0,
            }
      },
      {
        sequelize,
        modelName: "SalesLedger",
      }
    );



// Establish relationships
Sales.belongsToMany(Branch, {
  onDelete: "CASCADE",
  hooks: true,
  through: SalesBranch,
});
Branch.belongsToMany(Sales, { through: SalesBranch });

Branch.hasMany(SalesLedger);
SalesLedger.belongsTo(Branch);

Sales.hasMany(SalesLedger, { onDelete: "CASCADE", hooks: true });
SalesLedger.belongsTo(Sales);

module.exports = { Sales, SalesLedger,SalesBranch}
