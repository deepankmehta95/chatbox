const asyncHandler = require('express-async-handler')

const Message = require('../models/Message')
const User = require('../models/User')
const Chat = require('../models/Chat')

// Send message
// @POST /api/message
const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body

  if (!chatId || !content) {
    return res.status(400).send({ message: 'Invalid data sent in request' })
  }

  let newMessage = {
    sender: req.user._id,
    content,
    chat: chatId,
  }

  try {
    let message = await Message.create(newMessage)

    message = await message.populate('sender', 'name pic')
    message = await message.populate('chat')
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'name pic email',
    })

    await Chat.findOneAndUpdate(chatId, {
      latestMessage: message,
    })

    res.json(message)
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

// All messages
// @GET /api/message/:chatId
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name pic email')
      .populate('chat')

    res.json(messages)
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

module.exports = { sendMessage, allMessages }
