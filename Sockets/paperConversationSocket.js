
const { default: mongoose } = require('mongoose');
const  Conversation = require('../models/conversation');
const FriendsConversation = require('../models/friendConversation');

module.exports = (io) => {

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        console.log(`User with ID ${userId} connected`);
        socket.on('join-room',  (conversation_id) => {
            try {
                console.log('CONV id',conversation_id.toString());
                
                const conversation =  Conversation.findById(new mongoose.Types.ObjectId(conversation_id));
                const f_conversation =  FriendsConversation.findById(conversation_id)
                if (conversation) {
                    socket.join(conversation_id, async(err) => {
                         if (err) {
                            console.error(`Error joining room ${conversation_id}:`, err);
                        } else {
                            console.log(`Socket ${socket.id} joined room ${conversation_id}`);
                            console.log(`Rooms: ${Array.from(socket.rooms)}`);
                        }
                    });

                }else if(f_conversation){
                    console.log('friend conversation',f_conversation);
                    
                    socket.join(conversation_id, async(err) => {
                        if (err) {
                           console.error(`Error joining room ${conversation_id}:`, err);
                       } else {
                           console.log(`Socket ${socket.id} joined room ${conversation_id}`);
                           console.log(Object.keys(data.friendConversation));
                       }
                   });

                } 
                else {
                    console.log(`Conversation ${conversation_id} does not exist`);
                }
            } catch (error) {
                console.error('Error joining room:', error);
            }
        });
        
        socket.on('join-public-room',async()=>{
            socket.join('public-room')
            console.log(`User with ID ${userId} joined public room`); 
        })
        socket.on('send-to-public-room',async(data)=>{
            console.log('public data',data);
            
            await io.to('public-room').emit('receive-message', { m:  data.message.m  });
        })  
        socket.on('send-to-subchat',async (data)=>{
            console.log('data',data);
            

            data.members.forEach(async member=>{
                await io.to(member).emit('receive-message', { m:  data.message.m  });
            })
        })
        socket.on('send-message', async (data) => {
            
            console.log(data);
            
            try {
                if (data.id === '') {
                    socket.broadcast.emit('receive-message', data.m)
                } else {    
                    

                    await io.to(data.message.m.conversation_id).emit('receive-message', { m:  data.message.m  });
                    if (socket.rooms.has(data.message.m.conversation_id)) {
                        console.log('Socket is in the room');
                    } else {
                        console.log('Socket is not in the room');
                    }
                }
            } catch (error) {
                console.error('Error saving message:', error);
            }
        });
        socket.on('send-to-friend', async (data) => {
            console.log(data);
            
            try {
                if (data.id === '') {
                    socket.broadcast.emit('receive-message', data.m)
                } else {    
                    
                    console.log('conv id',data.message.m.conversation_id);
                    
                    await io.to(data.message.m.conversation_id).emit('receive-message', { m:  data.message.m,   });
                    if (socket.rooms.has(data.message.m.id)) {
                        console.log('Socket is in the room');
                    } else {
                        
                        console.log(socket.rooms);
                        
                        console.log('Socket is not in the room');
                    }
                }
            } catch (error) {
                console.error('Error saving message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        // Handle socket errors
        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        socket.on('error', (error) => {
            console.error('Error receiving message:', error);
        });
    });
};



