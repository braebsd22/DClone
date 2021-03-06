import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChannelService } from 'src/app/services/channel.service';
import { GuildService } from 'src/app/services/guild.service';
import { LogService } from 'src/app/services/log.service';
import { UsersService } from 'src/app/services/users.service';
import { WSService } from 'src/app/services/ws.service';

@Component({
  selector: 'app-dmchannel',
  templateUrl: './dmchannel.component.html',
  styleUrls: ['./dmchannel.component.css']
})
export class DMChannelComponent implements OnInit {
  channel: any;
  messages = [];

  loadedAllMessages = false;  
  emojiPickerOpen = false;

  chatBox = new FormControl();
  typingUsernames = [];

  private lastTypingEmissionAt = null;

  get recipient() {
    const recipientId = this.channel.recipientIds
      .filter(id => id !== this.userService.user._id)[0];    

    return this.userService.getKnown(recipientId);
  }

  constructor(
    private channelService: ChannelService,
    private guildService: GuildService,
    private log: LogService,
    private route: ActivatedRoute,
    private userService: UsersService,
    private ws: WSService) {}

  async ngOnInit() {
    await this.userService.init();
    await this.guildService.init();

    const channelId = this.route.snapshot.paramMap.get('channelId');
    this.channel = this.channelService.getDMChannelById(channelId);
    
    document.title = `@${this.recipient?.username}`;

    this.messages = await this.channelService.getMessages('@me', channelId);
    this.loadedAllMessages = this.messages.length < 25;
    
    setTimeout(() => this.scrollToMessage(), 100);
    
    this.hookWSEvents();
  }

  hookWSEvents() {
    this.ws.socket.on('TYPING_START', ({ user }) => {
      this.log.info('GET TYPING_START', 'text');

      const selfUserIsTyping = this.typingUsernames.includes(this.userService.user.username);
      if (!selfUserIsTyping)
        this.typingUsernames.push(user.username);

      setTimeout(() => this.stopTyping(user), 5.1 * 1000);
    });

    this.ws.socket.on('MESSAGE_CREATE', (message) => {
      this.log.info('GET MESSAGE_CREATE', 'text');

      this.messages.push(message);

      setTimeout(() => this.scrollToMessage(), 100);
    });
    
    this.ws.socket.on('MESSAGE_UPDATE', (message) => {
      this.log.info('GET MESSAGE_UPDATE', 'text');

      let index = this.messages.findIndex(m => m._id === message._id);
      this.messages[index] = message;      
    });
  }

  emitTypingStart() { 
    const sinceLastTyped = new Date().getTime() - this.lastTypingEmissionAt?.getTime();    
    if (sinceLastTyped < 5 * 1000) return;

    this.log.info('SEND TYPING_START', 'text');
    
    this.ws.socket.emit('TYPING_START',
      { channel: this.channel, user: this.userService.user });

    this.lastTypingEmissionAt = new Date();
  }
  private stopTyping(user: any) {
    const index = this.typingUsernames.indexOf(user.username);
    this.typingUsernames.splice(index, 1);
  }

  private scrollToMessage(end?: number) {
    const messages = document.querySelector('.messages');

    let combinedHeight = 0;    
    Array.from(document.querySelectorAll(`.message-preview`))
      .slice(0, end ?? this.messages.length)
      .forEach(e => combinedHeight += e.scrollHeight);

    messages.scrollTop = (end)
      ? messages.scrollHeight - combinedHeight
      : combinedHeight;
  }

  chat(content: string) {
    if (!content.trim()) return;
    
    (document.querySelector('#chatBox') as HTMLInputElement).value = '';
    
    this.log.info('SEND MESSAGE_CREATE', 'text');

    this.ws.socket.emit('MESSAGE_CREATE', {
      author: this.userService.user,
      channel: this.channel,
      content
    });

    this.stopTyping(this.userService.user);
  }
  
  shouldCombine(index: number) {
    const lastMessage = (index) ? this.messages[Math.max(0, index - 1)] : null;
    if (!lastMessage)
      return false;

    const message = this.messages[index];

    const isSameAuthor = message.author._id === lastMessage?.author._id;
    const duringSameHour = new Date(message.createdAt)
      .getHours() === new Date(lastMessage?.createdAt).getHours();    

    return isSameAuthor && duringSameHour;
  }

  async loadMoreMessages() {
    if (this.loadedAllMessages) return;

    this.log.info('Loading more messages', 'text');

    const moreMessages = await this.channelService
      .getMessages('@me', this.channel._id, {
        start: this.messages.length,
        end: this.messages.length + 25
      });
    
    this.scrollToMessage(this.messages.length);

    this.loadedAllMessages = moreMessages.length < 25;
    this.messages = moreMessages
      .concat(this.messages)
      .sort((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? 1 : -1);
  }

  // emoji picker
  addEmoji({ emoji }) {
    console.log(emoji.native);
    (document.querySelector('#chatBox') as HTMLInputElement).value += emoji.native;
  }

  onClick({ path }) {
    const emojiPickerWasClicked = path
      .some(n => n && n.nodeName === 'EMOJI-MART' || n.classList?.contains('emoji-icon'));
    this.emojiPickerOpen = emojiPickerWasClicked;
  }

  // manage users
  kickMember(user: any) {
    console.log(user);    
  }
}
