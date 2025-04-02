const {
    User, 
    UserLedger,
    UserBranch,
  } = require("../Models/UserModel");
const {Branch} = require("../Models/ProductsModel")
  const multer = require("multer");
  const fs = require("fs");
  const path = require("path");
  const sequelize = require("../database");
 
  
  async function deleteTable() {
    try {
      await UserLedger.drop();
      console.log("Table deleted successfully.");
    } catch (error) {
      console.error("Error deleting table:", error);
    }
  }
 
  
  const CreateUser = async (req, res) => {
    const { UserName, PassWord,branchName } = req.body;
  
    try {
      const [user, created] = await User.findOrCreate({
        where: { UserName },
        defaults: {
          UserName,
          PassWord
        },
      });

      const [branch, branchCreated] = await Branch.findOrCreate({
        where: { BranchName: branchName },
      });

      const [userBranch, userBranchCreated] =
      await UserBranch.findOrCreate({
        where: { UserId: user.id, BranchId: branch.id },
        defaults: {
            TotalSales:0,
            LastCustomerAttended:"none",
            LastAmountMade:0,
        },
      });

      UserLedger.create({
        Date:user.createdAt,
        Customer:"None",
        AmountIn:0,
    });
  
      res.status(200).json({ user, created });
    } catch (error) {
      console.error("Error in findOrCreate:", error);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request" });
    }
  };

  const GetAllUser = async (req, res) => {

    try {
      const user= await User.findAndCountAll({
        include: [
          {
            model: Branch,
            // through: { attributes: ["quantity"] }, // Include the quantity from ProductLocation
            include: [
              {
                model: UserLedger,
                // You can add conditions here if needed
              },
            ],
          },
          {
            model: UserLedger
          },
        ],
        order: [["createdAt", "DESC"]], // This replaces 
      });
  
      res.status(200).json(user.rows);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  const GetSingleUser = async(req,res)=>{
    const UserName = req.params.Name
    
    try {
  
      const Getone = await User.findOne({
        include: [
          {
            model: Branch,
            // through: { attributes: ["quantity"] }, // Include the quantity from ProductLocation
            include: [
              {
                model: UserLedger,
                // You can add conditions here if needed
              },
            ],
          },
          {
            model: UserLedger
          },
        ],
        where: {UserName}
      },
        ).then(result =>{
        res.status(200).json(result)
      })
    } catch (error) {
      res.status(400).json({error:error.message})
    }

  }

  const UpdateUser = async (req, res) => {
    const Userid = req.params.id;
  
    const {
        UserName, 
        PassWord
    } = req.body;
  
    try {
      // Update the database with the new image path
      User.update(
        {
            UserName, 
            PassWord
        },
        { where: { id: Userid } }
      )
        .then(() => {
          res.status(200).json({ message: "Record updated successfully" });
        })
        .catch((dbError) => {
          res.status(500).json({ error: dbError.message });
        });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const DeleteUser = async (req, res) => {
    try {
      const { id } = req.params;
  
      const Cat = await Product.destroy({
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
    CreateUser,
    GetAllUser,
    GetSingleUser,
    UpdateUser ,
    DeleteUser
  };