const User = require('../models/Users')
const Order = require('../models/Orders')
const bcrypt = require('bcrypt')

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = async (req, res) => {
    // Get all users from MongoDB
    const users = await User.find().select('-password').lean()

    // If no users 
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }

    res.json(users)
}

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = async (req, res) => {
    let { name, username, email, password, roles } = req.body
    username = username.toLowerCase()

    // Confirm data
    if (!name || !username || !password) {
        return res.status(400).json({ message: 'Name, Username, and Password are required' })
    }

    // Check for duplicate username
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Username already taken' })
    }

    // Hash password 
    const hashedPwd = await bcrypt.hash(password, 10) // 10 salt rounds

    const userObject = (!Array.isArray(roles) || !roles.length)
        ? { name, username, email, "password": hashedPwd }
        : { name, username, email, "password": hashedPwd, roles }

    // Create and store new user 
    const user = await User.create(userObject)

    if (user) { //created 
        res.status(201).json({ message: `Created new user ${username}` })
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
}

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = async (req, res) => {
    let { _id, name, username, email, roles, active, password } = req.body
    username = username.toLowerCase()

    // Confirm data 
    if (!_id || !name || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields except password are required' })
    }

    // Does the user exist to update?
    const user = await User.findById(_id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Check for duplicate 
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    // Allow updates to the original user 
    if (duplicate && duplicate?._id.toString() !== _id) {
        return res.status(409).json({ message: 'Username already taken' })
    }

    user.name = name
    user.username = username
    user.email = email
    user.roles = roles
    user.active = active

    if (password) {
        // Hash password 
        user.password = await bcrypt.hash(password, 10) // 10 salt rounds 
    }

    const updatedUser = await user.save()

    res.json({ message: `Updated ${updatedUser.username}` })
}

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' })
    }

    // Does the user still have assigned notes?
    const order = await Order.findOne({ "salesman._id": id }).lean().exec()
    if (order) {
        return res.status(400).json({ message: 'User has assigned orders' })
    }

    // Does the user exist to delete?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}