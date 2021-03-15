import { useEffect, useRef, useState } from 'react';
import socketIOClient from 'socket.io-client';

const NEW_MASSAGE_EVENT = "newMessageEvent";
const PLAYER_EVENT = 'playerEvent';
const PLAYED_CARD_EVENT = 'cardPlayedEvent';
const PLAYER_CARD_EVENT = 'cardPlayerEvent';

const SOCKET_SERVER_URL = 'http://192.168.0.10:4000';

const useGameRoom = (roomId, pseudo) => {
  const [players, setPlayers] = useState([]);
  const [playedCards, setPlayedCards] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [isMaster, setMaster] = useState(false);
  const socketRef = useRef();

  useEffect(() => {    
    // Creates a WebSocket connection
    socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
      query: { roomId, pseudo },
    });

    // Listens for players connect/disconnect
    socketRef.current.on(PLAYER_EVENT, (players) => {
      console.log("new PlayerList", players);
      setPlayers(players);
      let master = players.find(p => p.isMaster && p.id === socketRef.current.id);
      setMaster(master !== undefined);
    });

    // Listens for global cards update
    socketRef.current.on(PLAYED_CARD_EVENT, (cards) => {
      console.log("new played CardList", cards);
      setPlayedCards(cards);
    });

    // Listens for player cards update
    socketRef.current.on(PLAYER_CARD_EVENT, (cards) => {
      console.log("new player CardList", cards);
      setPlayerCards(cards);
    });
    
    // Destroys the socket reference
    // when the connection is closed
    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId, pseudo]);

  // Send a message to the server
  const sendMessage = (messageAction) => {
    socketRef.current.emit(NEW_MASSAGE_EVENT, {
      action: messageAction,
      senderId: socketRef.current.id,
    });
  };

  return { sendMessage, players, playedCards, playerCards, isMaster };
};

export default useGameRoom;