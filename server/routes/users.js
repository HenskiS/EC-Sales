/*
const jwt =  require('jsonwebtoken');
const bcrypt =  require('bcrypt');
const UserModel =  require('../models/Users.js');
const asyncHandler = require('express-async-handler')
*/
const express =  require("express");
const usersController = require('../controllers/usersController')
const verifyJWT = require('../middleware/verifyJWT');

const router = express.Router();
router.use(verifyJWT)

router.route('/')
    .get(usersController.getAllUsers)
    .post(usersController.createNewUser)
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser)

/*router.post("/register", async (req, res) => {
    const { username, name, password } = req.body;
    const user = await UserModel.findOne({ username });

    if (user) {
        return res.json({ message: "Username is taken!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({ username, name, password: hashedPassword });
    await newUser.save();

    res.json({ message: "User Registered Successfully!"});
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });

    if (!user) {
        return res.json({ message: "User does not exist!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.json({ message: "Username or Password Is Incorrect!" });
    }

    const token = jwt.sign({ id: user._id }, "secret");
    res.json({ token, userID: user._id, name: user.name });
});*/

//export { router as userRouter };
module.exports = router