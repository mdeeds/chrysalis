import { Gem } from "./gem";

export class GemBox {
  private container: HTMLDivElement;
  private gemSet: Set<number>;
  constructor() {
    this.container = document.createElement('div');
    this.container.classList.add('gembox');
    this.gemSet = new Set<number>();
    this.resetGems();
    document.getElementsByTagName('body')[0].appendChild(this.container);
  }

  private resetGems() {
    this.container.innerHTML = "";
    for (let i = 0; i < 8; ++i) {
      const rot = i * (360 / 8);
      this.addGem(rot, this.gemSet.has(i));
    }
  }

  private addGem(rotate: number, obtained: boolean) {
    const img = document.createElement('img');
    img.classList.add('gem');
    img.style.setProperty('filter', `hue-rotate(${rotate}deg)`);
    img.src = obtained ? 'img/YesGem.png' : 'img/NoGem.png';
    this.container.appendChild(img);
    img.width = 32;
  }

  collect(gem: Gem) {
    const gemId = gem.state.data.gemId;
    if (this.gemSet.has(gemId)) {
      return;
    }
    this.gemSet.add(gemId);
    this.resetGems();
  }

  getGemLevel() {
    return this.gemSet.size;
  }
}