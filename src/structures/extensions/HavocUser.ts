import { User } from 'discord.js';

export default class extends User {
  get pfp() {
    return super.displayAvatarURL({ dynamic: true, size: 4096 });
  }
}
