const {Model, DataTypes } = require("sequelize")
const sequelize = require("../database")
const {Branch} = require("./ProductsModel")

class  User extends Model{}

 User.init({
      UserName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      PassWord: {
        type: DataTypes.STRING,
        allowNull: false
      }
      
    }, {
      sequelize, // Pass the sequelize instance
      modelName: 'Users' // Set the model name
    });

class UserBranch extends Model {}

UserBranch.init(
  {
    TotalSales: {
        type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    
    LastCustomerAttended: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 0,
    },
    LastAmountMade: {
    type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    
  },
  {
    sequelize,
    modelName: "UserBranch",
  }
);
class UserLedger extends Model {}

UserLedger.init(
  {
    Date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    Customer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    AmountIn: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: "UserLedger",
  }
);



// Establish relationships
User.belongsToMany(Branch, {
    onDelete: "CASCADE",
    hooks: true,
    through: UserBranch,
  });
  Branch.belongsToMany(User, { through: UserBranch });
  
  Branch.hasMany(UserLedger);
  UserLedger.belongsTo(Branch);
  
  User.hasMany(UserLedger, { onDelete: "CASCADE", hooks: true });
  UserLedger.belongsTo(User);
  
  module.exports = { User, UserLedger,UserBranch}