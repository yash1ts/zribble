import Client from "../client"

export function newRoom() {
    return async (dispatch, getState) => {
        const result = await Client.roomInit();
        console.log(result)
        dispatch({
            type:'new',
            data: result.room_id
        })
    }
}

export function sendMessage(message) {
    return async (dispatch, getState) => {
        Client.sendMessagetoPeers(message);
        Client.sendMessagetoServer(message);
        const state = getState();
        console.log(message)
        dispatch({
            type:'game_chat',
            data: {id: state.user.id, message}
        })
    }
}

export function turnOnVoice(){
    return async (dispatch, getState) => {
        Client.voiceStream.getAudioTracks().forEach((it)=>{
            it.enabled = true;
        })
    }
}

export function turnOffVoice(){
    return async (dispatch, getState) => {
        Client.voiceStream.getAudioTracks().forEach((it)=>{
            it.enabled = false;
        })
    }
}
