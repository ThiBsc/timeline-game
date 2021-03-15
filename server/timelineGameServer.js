const cards = require("./Cards");

const server = require("http").createServer();
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const PORT = 4000;
const NEW_MASSAGE_EVENT = "newMessageEvent";
const PLAYER_EVENT = 'playerEvent';
const PLAYED_CARD_EVENT = 'cardPlayedEvent';
const PLAYER_CARD_EVENT = 'cardPlayerEvent';

let roomPlayers = {};
let deckCards = cards.monuments;

shuffle = (a) => {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}

dispatchCards = (roomId, cardPerPlayer) => {
  let room = roomPlayers[roomId];
  let cards = room.cards;
  // Get all player and played card back to the deck
  cards = cards.concat(room.playedCards);

  room.playedCards = [];
  room.players.forEach(p => {
    cards = cards.concat(p.cards);
    p.cards = [];
  });

  cards = shuffle(cards);
  room.playedCards.push(cards.shift());
  for (let i=0; i<cardPerPlayer; i++){
    // Dispatch the deck to players
    room.players.forEach(p => {
      p.cards.push(cards.shift());
    });
  }
  room.cards = cards;
}

io.on("connection", (socket) => {
  
  // Join a room
  const { roomId, pseudo } = socket.handshake.query;
  socket.join(roomId);

  // Init or update the room
  if (roomPlayers[roomId] === undefined) {
    // The deck
    let deck = [...deckCards];
    // Random starting card
    let index = Math.floor(Math.random() * deck.length);
    let playedCards = [...deck.splice(index, 1)];

    roomPlayers[roomId] = {
      players: [{pseudo: pseudo, isMaster: true, id: socket.id, cards: []}],
      playedCards: playedCards,
      cards: deck
    };
  } else {
    roomPlayers[roomId].players = [...roomPlayers[roomId].players, {pseudo: pseudo, id: socket.id, cards: []}];
  }

  console.log("connection", roomId, pseudo);
  // Send the new list of players to all
  io.in(roomId).emit(PLAYER_EVENT, roomPlayers[roomId].players);
  // Send room info to the new player
  io.to(socket.id).emit(PLAYED_CARD_EVENT, roomPlayers[roomId].playedCards);

  // Listen for new messages
  socket.on(NEW_MASSAGE_EVENT, (data) => {
    console.log("action message", data);
    switch (data.action){
      case 'shuffle':
        // Shuffle and give card to every players in the room
        dispatchCards(roomId, 2);
        roomPlayers[roomId].players.forEach(p => {
          console.log(p.id);
          io.to(p.id).emit(PLAYER_CARD_EVENT, p.cards);
        });
        // Send the beggining card to everyone
        io.in(roomId).emit(PLAYED_CARD_EVENT, roomPlayers[roomId].playedCards);
        break;
      default:
        break;
    }
  });

  // Leave the room if the user closes the socket
  socket.on("disconnect", () => {
    console.log("disconnect", roomId, pseudo);
    // Find the leaving player
    let leavingPlayer = roomPlayers[roomId].players.find(p => p.id === socket.id);
    // Remove it
    roomPlayers[roomId].players = roomPlayers[roomId].players.filter(p => p.id !== socket.id);
    // Put back the player card in the deck
    roomPlayers[roomId].cards = [...roomPlayers[roomId].cards, ...leavingPlayer.cards];
    // If the room is empty, delete
    if (roomPlayers[roomId].players.length === 0){
      delete roomPlayers[roomId];
    } else {
      // If the leaving player is the master, change it
      if (leavingPlayer.isMaster){
        roomPlayers[roomId].players[0]["isMaster"] = true;
      }
      io.in(roomId).emit(PLAYER_EVENT, roomPlayers[roomId].players);
    }
    socket.leave(roomId);
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
