const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize("whatsappmsg", "root", process.env.ROOT_PASSWORD, {
  host: "127.0.0.1",
  dialect: "mysql",
  port: 3306,
  logging: false,
  dialectOptions: {
    connectTimeout: 60000,
  },
});

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Mysql Database is Connected!");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

connectToDatabase();

module.exports = sequelize;