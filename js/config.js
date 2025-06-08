const mongoose = require("mongoose");
const { type } = require("os");
const connect = mongoose.connect("mongdb://localhost:27017/login");

connect.then(() => {
    console.log("done");
})
    .catch(() => {
        console.log("error");
    });


const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    pass: {
        type: String,
        required: true
    }
});

const collection = new mongoose.model("users", LoginSchema);

module.exports = collection;
