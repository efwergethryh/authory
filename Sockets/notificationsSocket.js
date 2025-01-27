const { default: mongoose } = require('mongoose');

let users = {};
module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('disconnect', () => {
            for (let userId in users) {
                if (users[userId] === socket.id) {
                    delete users[userId];
                    break;
                }
            }
        });
        socket.on('register', ({ userId, mainfield }) => {
            console.log('user id', userId, mainfield);

            users[userId] = { socketId: socket.id, mainfield };

            console.log('user', users);

        });
        socket.on('disconnect', () => {
            for (let userId in users) {
                if (users[userId] === socket.id) {
                    delete users[userId];
                    break;
                }
            }
        });
        socket.on('send-notification', (data) => {
            console.log('data send-notification',data);
            
            try {
                if (data.receiver) {
                    
                    console.log('send notification data', data);

                    socket.to(users[data.receiver].socketId).emit('receive-notification', { data })

                } else {

                }
            } catch (error) {
                console.log(error);
            }
        })
        socket.on('notify-conversation', (data) => {
            console.log('data', data);

            if (data.receiver) {
                socket.to(users[data.receiver].socketId).emit('receive-notification-fromconversation', { data })

            } else {

            }
        })
        socket.on('notify-publicgroup', async (data) => {

            if (data.message.profession =='') {
                await socket.to('public-room').emit('receive-notification', { m: data.message.m });
            }

            else {
                
                for (const [key, { socketId, mainfield }] of Object.entries(users)) {
                
                    if (data.message.mainfield === mainfield) {
                
                        await socket.to(socketId).emit('receive-notification', { m: data.message.m });
                    }
                }
                
            }
        })
    })
}