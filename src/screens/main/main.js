import React from 'react';
import { Link } from 'react-router-dom';

export function Main({roomId, actions}){
    const createRoom = ()=>{
        actions.newRoom();
    }
    return (
        <div>
            <h1>
                Main
            </h1>
            <button onClick={createRoom}>Create room</button>
            <h1>{roomId}</h1>
            {roomId&&<Link to={`/rooms/${roomId}`} >Start</Link>}
        </div>
    )
}