const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database");


class Product extends Model {}

Product.init(
  {
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ImagePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Quantity:{
      type:DataTypes.INTEGER,
      allowNull:false
    },
    Previous_Qty:{
      type:DataTypes.INTEGER,
      allowNull:false
    },
    NewQtyAdded:{
      type:DataTypes.INTEGER,
      allowNull:false
    },
    TotalQuantity:{
      type:DataTypes.INTEGER,
      allowNull:false
    },
  },
  {
    sequelize,
    modelName: "Product",
  }
);

class Branch extends Model {}

Branch.init(
  {
    BranchName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Branch",
  }
);


class ProductBranch extends Model {}

ProductBranch.init(
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    QtyRem: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    QtySold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    AmountInCash: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    }
  },
  {
    sequelize,
    modelName: "ProductBranch",
  }
);

class ProductLedger extends Model {}

ProductLedger.init(
  {
    Date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    
    QtyIn: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    QtyOut: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ProductLedger",
  }
);

// Establish relationships
Product.belongsToMany(Branch, {
  onDelete: "CASCADE",
  hooks: true,
  through: ProductBranch,
});
Branch.belongsToMany(Product, { through: ProductBranch });

Branch.hasMany(ProductLedger);
ProductLedger.belongsTo(Branch);

Product.hasMany(ProductLedger, { onDelete: "CASCADE", hooks: true });
ProductLedger.belongsTo(Product);

module.exports = { Product, ProductLedger, Branch, ProductBranch };
