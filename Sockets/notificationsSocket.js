const { default: mongoose } = require('mongoose');

let users ={};
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
        socket.on('register', (userId) => {
            console.log('user id',userId);
            
            users[userId] = socket.id; 
            console.log('user',users);
            
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
            try {
               if (data.receiver) {
                console.log('send notification data',data);
                
                socket.to(users[data.receiver]).emit('receive-notification', { data })
                
               } else {
                    
               }
            } catch (error) {
                console.log(error);
            }
        })
        socket.on('notify-conversation',(data)=>{
            console.log('data',data);
            
            if (data.receiver) {
                console.log('sending notificaiont to user',users[data.receiver])
                socket.to(users[data.receiver]).emit('receive-notification-fromconversation', { data })
                
               } else {
                    
               }
        })
        socket.on('notify-publicgroup',(data)=>{
            console.log('sending to public group', data);
            
            for (const [userId, socketId] of Object.entries(users)) {
                io.to(socketId).emit('receive-notification', {
                   data
                });
            }

        })
    })
}