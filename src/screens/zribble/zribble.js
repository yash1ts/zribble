import { Input } from '@chakra-ui/input';
import { ListItem, UnorderedList } from '@chakra-ui/layout';
import { Switch } from '@chakra-ui/switch';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import Client from '../../client';

export function Zribble({actions, messages}){
    const {id} = useParams();
    const message = useRef('');
    const voice = useRef(true);
    useEffect(()=>{
        Client.joinRoom(id);
    }, [])
    const onSend = ()=>{
        actions.sendMessage(message.current);
    }
    const toggleVoice = ()=>{
        if(voice.current){
            voice.current = false;
            actions.turnOffVoice();
        }else{
            voice.current = true;
            actions.turnOnVoice();
        }
    }
    return (
        <div>
            <div>
            {`Game ${id}`}
            </div>
            <button onClick={toggleVoice}>Voice</button>
            <Input placeholder="message" onChange={(event)=>{message.current = event.target.value}}/>
            <button onClick={onSend}>send</button>
            <UnorderedList>
                {
                    messages.map((it, index)=>{
                        return(
                            <ListItem key={index}>{`${it.id}: ${it.message}`}</ListItem>
                        )
                    })
                }
            </UnorderedList>
        </div>
    )
}