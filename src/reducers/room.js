const initial = {
}

export default function room(state = initial, action){
    switch(action.type){
        case 'new': return {
            id: action.data
        }

        default: return state
    }
}