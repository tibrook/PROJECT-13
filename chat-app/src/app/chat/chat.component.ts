import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [FormsModule,CommonModule],
  standalone: true,
})
export class ChatComponent implements OnInit {
  username: string = '';
  message: string = '';
  messages: any[] = [];
  connected: boolean = false;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit(): void {}

  registerUser() {
    if (this.username.trim()) {
      this.connected = true;
      this.websocketService.connect((message) => {
        this.showMessage(message);
      });
    }
  }

  sendMessage() {
    if (this.message.trim()) {
      const chatMessage = { from: this.username, text: this.message };
      this.websocketService.sendMessage(chatMessage);
      this.message = '';
    }
  }

  showMessage(message: any) {
    this.messages.push(message);
  }
}
