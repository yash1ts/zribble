import axios from 'axios';
import SimplePeer from 'simple-peer';
import appStore from '../store';
import crypto from 'crypto';

export default class Client {
  baseUrl = 'https://localhost:3001/';

  websocketUrl = 'ws://localhost:3001/'

  roomId = null;

  webSocket = null;

  peers = {};

  getRoomInitRoute = () => (this.websocketUrl + 'room/init');

  getRoomJoinRoute = (id) => (this.websocketUrl + 'room/join/'+ id);

  doFetch = async (method, url, data = {}) => {
    console.log(`Client: fetching [${method}] route ${this.baseUrl + url}`);
    try {
      const response = await axios({method, url: this.baseUrl + url, data});
      // console.log(response.data);
      return response.data;
    } catch (error) {
      // console.log(error.response.data);
      return error.response?.data || {error};
    }
  };

  websocketInit = async () => {
    if(!this.webSocket) {
      this.webSocket = new WebSocket(this.getRoomInitRoute());
      this.webSocket.onmessage = (t)=>{
        const msg = JSON.parse(t.data)
        switch(msg.type){
          case 'create_ans': 
            console.log('create_ans');
            const peer = new SimplePeer({initiator:false, trickle: false});
            const id = crypto.randomBytes(16).toString("base64");
            peer.sdp = msg.data.sdp;
            peer.on('connect', ()=>{
              console.log('connected rtc');
              Object.keys(this.peers).forEach((key)=>{
                this.peers[key].send(JSON.stringify({type: 'create_offer', data:{id}}));
                this.peers[key].on('data', (data)=>{
                  const msg = JSON.parse(data);
                  if(msg.type==='offer'){
                    peer.send(JSON.stringify({type: 'create_ans', data: {id: key, offer: msg.data}}))
                  }
                })
              })
              this.peers[id] = peer;
            })
            peer.on('data',(data)=>{
              const msg = JSON.parse(data);
              if(msg.type==='answer'){
                this.peers[msg.data.id].send(JSON.stringify({type:'receive_ans', data:{id, answer:msg.data.answer}}))
              }
              if(msg.type === 'chat'){
                appStore.dispatch(msg);
              }
            })
            peer.on('signal', (data)=>{
              this.webSocket.send(JSON.stringify({type:'answer', data:{
                id: msg.data.id, sdp: data
              }}));
            })
            peer.signal(msg.data.sdp);
            peer.on('close', ()=>{
              delete this.peers[id];
            })
          break;
          case 'create_link':
            console.log('create_link');
            this.roomId = msg.data.id;
            appStore.dispatch({
              type:'new',
              data: msg.data.id
            })
            break;

          default : break;
        }
      }
    }
  }

  joinRoom = async (id) => {
    const adminPeer = new SimplePeer({initiator:true, trickle: false});
    adminPeer.on('data',(data)=>{
      const msg = JSON.parse(data);
      switch(msg.type){
        case 'create_ans':
          const peer0 = new SimplePeer({initiator:false, trickle: false});
          peer0.on('signal', (data)=>{
            adminPeer.send(JSON.stringify({type:'answer', data:{id:msg.data.id, answer: data}}))
          });
          peer0.signal(msg.data.offer);
          peer0.on('connect', ()=>{
            this.peers[msg.data.id] = peer0;
            console.log('connected'+msg.data.id)
          })
          peer0.on('close', ()=>{
            delete this.peers[msg.data.id]
          })
          peer0.on('data',(data)=>{
            const msg = JSON.parse(data)
            if(msg.type=== 'chat'){
              appStore.dispatch(msg)
            }
          })
          break;
        case 'create_offer':
          const peer = new SimplePeer({initiator:true, trickle: false});
          this.peers[msg.data.id] = peer;
          peer.on('signal', (data)=>{
            adminPeer.send(JSON.stringify({type:'offer', data}))
          });
          peer.on('connect', ()=>{
            console.log('connected')
          })
          peer.on('close',()=>{
            delete this.peers[msg.data.id]
          })
          peer.on('data',(data)=>{
            const msg = JSON.parse(data)
            if(msg.type=== 'chat'){
              appStore.dispatch(msg)
            }
          })
        break;
        case 'receive_ans':
            this.peers[msg.data.id].signal(msg.data.answer)
          break;
        case 'chat':
          appStore.dispatch(msg);
          break;
        default:
      }
    })
    adminPeer.on('signal', (data)=>{
      this.webSocket = new WebSocket(this.getRoomJoinRoute(id));
      this.webSocket.onopen = ()=>{
        console.log('opened')
        this.webSocket.send(JSON.stringify({type: 'join', data}));
      }
      this.webSocket.onmessage = (t) =>{
        const msg = JSON.parse(t.data);
        if(msg.type === 'receive_ans'){
          adminPeer.signal(msg.data);
        }
      }
    })
    adminPeer.on('connect', ()=>{
      console.log('connected admin')
      this.webSocket.close();
    })
  }
}
