const initial = {
    messages: []
}

export default function chat(state = initial, action){
    switch(action.type){

        case 'game_chat': 
            const newstate = Object.assign({}, state);
            newstate.messages = [action.data, ...state.messages]
            return newstate;

        default: return state
    }
}