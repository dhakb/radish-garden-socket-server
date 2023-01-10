const {Server} = require("socket.io")

// Configuration
const io = new Server({
    cors: {
        origin: "http://localhost:3000"
    }
})

let onlineUsers = []
// Helper functions
const addUser = (userId, socketId) => {
    onlineUsers.filter((user) => user.id !== userId)
    onlineUsers.push({userId, socketId})
}
const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socketId)
}
const findUser = (userId) => {
    return onlineUsers.find((user) => user.userId === userId)
}


// Connection
io.on("connection", (socket) => {
    console.log("user got connected")
    // Listen to "addUser" event sent from client and grab currentUserId and its socketId push to online users
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id)
        // and Send "getUser" event to client with updated users collection
        io.emit("getUsers", onlineUsers)
    })

    // Send And Get Message
    socket.on("sendMessage", (receiverId, message) => {
        const receiver = findUser(receiverId)
        receiver && io.to(receiver.socketId).emit("getMessage", message)
    })


    // Listen to "disconnect" event sent from client remove user from collection and send updated collection
    socket.on("disconnect", () => {
        console.log("user got disconnected")
        removeUser(socket.id)
        io.emit("getUsers", onlineUsers)
    })

})

let PORT = process.env.PORT || 8900
io.listen(PORT)