
const { default: mongoose } = require('mongoose');
const Conversation = require('../models/conversation');
const FriendsConversation = require('../models/friendConversation');
let users = {};
module.exports = (io) => {

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        const profession = socket.handshake.query.profession;
        console.log(`User with ID ${userId} connected`);
        // socket.on('register', (userId) => {
        //     console.log('user id', userId);

        //     users[userId] = {socketId:socket.id,profession};
        //     console.log('user', users);

        // }); 
        // socket.on('joinRoom', (roomID, ) => {
        //     socket.join(roomID);
        //     console.log(`user joined room: ${roomID}`);
        
        //     // Emit event to other users in the room
        //     socket.to(roomID).emit('userJoinedRoom', {
        //       id: socket.id,
        //       username: userData.name,
        //       mobile: userData.mobile,
        //     });
        
        //     callback('Joined successfully');
        //   });
        // socket.on('userJoinedRoom', (userID) => {

        //     socket.emit('userJoinedRoom', {
        //         id: socket.id,
        //         userID
        //     });

           
        // });

        // // Handling mute/unmute toggle
        // socket.on('toggleMute', (roomID) => {
        //     socket.to(roomID).emit('userMuteStatusChanged', { userID: socket.id, isMuted: true });
        // });

        // // Handling video on/off toggle
        // socket.on('toggleVideo', (roomID) => {
        //     socket.to(roomID).emit('userVideoStatusChanged', { userID: socket.id, isVideoOn: true });
        // });

        // // Screen share
        // socket.on('startScreenShare', (roomID) => {
        //     socket.to(roomID).emit('userStartedScreenShare', socket.id);
        // });

        // socket.on('stopScreenShare', (roomID) => {
        //     socket.to(roomID).emit('userStoppedScreenShare', socket.id);
        // });

        // // Sending messages
        // socket.on('sendMessage', (roomID, message) => {
        //     socket.to(roomID).emit('newMessage', {
        //         user: socket.id,
        //         message: message,
        //     });
        // });

        // Handle user disconnect
        socket.on('disconnect', () => {
            console.log('user disconnected:', socket.id);
            // Notify others in the room about the user leaving
            io.emit('userRemoved', { id: socket.id });
        });
        socket.on('register', ({ userId, mainfield }) => {
            console.log('user id', userId, mainfield);

            users[userId] = { socketId: socket.id, mainfield };
            console.log('user', users);

        });
        socket.on('join-room', (conversation_id) => {
            try {
                console.log('CONV id', conversation_id.toString());

                const conversation = Conversation.findById(new mongoose.Types.ObjectId(conversation_id));
                const f_conversation = FriendsConversation.findById(conversation_id)
                if (conversation) {
                    socket.join(conversation_id, async (err) => {
                        if (err) {
                            console.error(`Error joining room ${conversation_id}:`, err);
                        } else {
                            console.log(`Socket ${socket.id} joined room ${conversation_id}`);
                            console.log(`Rooms: ${Array.from(socket.rooms)}`);
                        }
                    });

                } else if (f_conversation) {
                    console.log('friend conversation', f_conversation);

                    socket.join(conversation_id, async (err) => {
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

        socket.on('join-public-room', async () => {
            socket.join('public-room')
            console.log(`User with ID ${userId} joined public room`);
        })
        socket.on('send-to-public-room', async (data) => {
            if (data.message.profession == '') {
                await io.to('public-room').emit('receive-message', { m: data.message.m });
            }

            else {

                for (const [key, { socketId, profession }] of Object.entries(users)) {

                    if (data.message.mainfield === profession) {

                        await socket.to(socketId).emit('receive-message', { m: data.message.m });
                    }
                }

            }
        })
        socket.on('send-to-subchat', async (data) => {
            console.log('data', data);


            data.members.forEach(async member => {
                await io.to(member).emit('receive-message', { m: data.message.m });
            })
        })
        socket.on('send-message', async (data) => {

            console.log(data);

            try {
                if (data.id === '') {
                    socket.broadcast.emit('receive-message', data.m)
                } else {


                    await io.to(data.message.m.conversation_id).emit('receive-message', { m: data.message.m });
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

                    console.log('conv id', data.message.m.conversation_id);

                    await io.to(data.message.m.conversation_id).emit('receive-message', { m: data.message.m, });
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
        }
        );

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



