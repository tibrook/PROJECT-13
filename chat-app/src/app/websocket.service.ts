import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: any = null;

  connect(callback: (message: any) => void) {
    const socket = new SockJS('http://127.0.0.1:8081/chat');
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({}, () => {
      console.log('Connected to WebSocket');
      this.stompClient.subscribe('/topic/messages', (messageOutput: any) => {
        callback(JSON.parse(messageOutput.body));
      });
    }, (error: any) => {
      console.error('Connection error: ', error);
    });
  }

  sendMessage(message: any) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send('/app/sendMessage', {}, JSON.stringify(message));
    }
  }
}
