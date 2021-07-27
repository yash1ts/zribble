import axios from 'axios';
import SimplePeer from 'simple-peer';
import appStore from '../store';

export default class Client {
  baseUrl = 'http://localhost:3001/';

  websocketUrl = 'ws://localhost:3001/'

  roomId = null;

  webSocket = null;

  voiceStream = null;

  peers = {};

  getRoomInitRoute = () => ('room/init');

  getRoomJoinRoute = (id) => (this.websocketUrl + 'room/join/'+ id);

  doFetch = async (method, url, data = {}) => {
    console.log(`Client: fetching [${method}] route ${this.baseUrl + url}`);
    try {
      const response = await axios({method, url: this.baseUrl + url, data});
      // console.log(response?.data);
      return response.data;
    } catch (error) {
      // console.log(error?.response?.data);
      return error.response?.data || {error};
    }
  };

  roomInit = async () => {
    return this.doFetch('GET', this.getRoomInitRoute());
  }

  joinRoom = async (id) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });
    this.voiceStream = stream;
    this.roomId = id;
    this.webSocket = new WebSocket(this.getRoomJoinRoute(id));
    this.webSocket.onopen = ()=>{
      console.log('opened');
    }
    this.webSocket.onmessage = (t)=>{
      const msg = JSON.parse(t.data);
      switch(msg.type){
        case 'create_offer':
          console.log('create_offer'+msg.data.id);
          const peer = new SimplePeer({initiator: true, trickle: false, stream: this.voiceStream});
          peer.id = msg.data.id;
          peer.on('signal',(data)=>{
            this.webSocket.send(JSON.stringify({type:'offer', data:{id: msg.data.id, offer:data}}))
          });
          this.peers[msg.data.id] = peer;
          peer.on('connect', ()=>{
            console.log('connected rtc');
          })
          peer.on('error', (e)=>{
            console.log(e)
          })
          peer.on('close',()=>{
            delete this.peers[msg.data.id];
          })
          peer.on('data',(data)=>{
            const msg = JSON.parse(data);
            if(msg.type === 'game_chat'){
              appStore.dispatch({
                type:'game_chat',
                data:{id: peer.id, message: msg.data}
              })
            }
          })
          peer.on('stream', (stream)=>{
            document.body.getElementsByTagName('audio')[0].srcObject = stream;
          })
          break;
        case 'receive_ans':
          console.log('receive_ans'+msg.data.id);
          this.peers[msg.data.id].signal(msg.data.answer);
        break;
        case 'create_ans':
          console.log('create_ans');
          const peer0 = new SimplePeer({initiator: false, trickle: false, stream: this.voiceStream});
          peer0.id = msg.data.id;
          peer0.on('signal',(data)=>{
            this.webSocket.send(JSON.stringify({type:'answer', data:{id:msg.data.id, answer: data}}))
          })
          peer0.signal(msg.data.offer);
          peer0.on('connect',()=>{
            console.log('connected rtc');
            this.peers[msg.data.id] = peer0;
          })
          peer0.on('error', (e)=>{
            console.log(e)
          })
          peer0.on('close',()=>{
            delete this.peers[msg.data.id];
          })
          peer0.on('data',(data)=>{
            const msg = JSON.parse(data);
            if(msg.type === 'game_chat'){
              appStore.dispatch({
                type:'game_chat',
                data:{id: peer0.id, message: msg.data}
              })
            }
          })
          peer0.on('stream', (stream)=>{
            document.body.getElementsByTagName('audio')[0].srcObject = stream;
          })
        break;
        default: break;
      }
    }
  }

  sendMessagetoPeers = async (message)=>{
    Object.values(this.peers).forEach((it)=>{
      it.send(JSON.stringify({type:'game_chat', data: message}));
    })
  }

  sendMessagetoServer = async (message)=>{
    this.webSocket.send(JSON.stringify({type:'game_chat', data: message}));
  }
}
