const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

const Contacts = sequelize.define(
  "Contacts",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    profile: {
      type: DataTypes.JSON,
    },
    wa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Contacts",
    updatedAt: false,
  }
);

(async () => {
  await Contacts.sync({ force: false });
})();

module.exports = Contacts;