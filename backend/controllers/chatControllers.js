const asyncHandler = require('express-async-handler')

const Chat = require('../models/Chat')
const User = require('../models/User')

// Access Chat
// @POST /api/chat
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body

  if (!userId) {
    res.status(400)
    throw new Error('No user id is required')
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate('users', '-password')
    .populate('latestMessage')

  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'name pic email',
  })

  if (isChat.length > 0) {
    res.send(isChat[0])
  } else {
    var chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId],
    }

    try {
      const createdChat = await Chat.create(chatData)

      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'users',
        '-password'
      )

      res.status(200).send(FullChat)
    } catch (error) {
      res.status(400)
      throw new Error(error.message)
    }
  }
})

// Get Chat
// @GET /api/chat
const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: 'latestMessage.sender',
          select: 'name pic email',
        })

        res.status(200).send(results)
      })
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

// Create Group Chat
// @GET /api/chat/group
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.name || !req.body.users) {
    return res.status(400).send({ message: 'All the fields are mandatory' })
  }

  let users = JSON.parse(req.body.users)

  if (users.length < 2) {
    return res
      .status(400)
      .send('More than 2 users are required to form a group chat')
  }

  users.push(req.user)

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users,
      isGroupChat: true,
      groupAdmin: req.user,
    })

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')

    res.status(200).send(fullGroupChat)
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

// Rename Group Chat
// @PUT /api/chat/rename
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    {
      new: true,
    }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password')

  if (!updatedChat) {
    res.status(400)
    throw new Error('Chat not found')
  } else {
    res.json(updatedChat)
  }
})

// Add User to Group
// @PUT /api/chat/groupeadd
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: {
        users: userId,
      },
    },
    {
      new: true,
    }
  )

  if (!added) {
    res.status(400)
    throw new Error('Chat not found')
  } else {
    res.json(added)
  }
})

// Remove User to Group
// @PUT /api/chat/groupremove
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        users: userId,
      },
    },
    {
      new: true,
    }
  )

  if (!removed) {
    res.status(400)
    throw new Error('Chat not found')
  } else {
    res.json(removed)
  }
})

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
}
