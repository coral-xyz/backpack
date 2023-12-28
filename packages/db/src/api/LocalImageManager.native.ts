import { getImage } from "../db/images";

export class LocalImageManager {
  static instance: LocalImageManager;
  queue: { image: string; timestamp: number; fullImage?: boolean }[] = [];

  private constructor() {
    this.process();
  }

  async process() {
    this.queue = this.queue
      .filter((x) => (new Date().getTime() - x.timestamp) / 1000 > 3600)
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    const nextEl = this.queue.pop();
    if (nextEl) {
      await this.storeImageInLocalStorage(nextEl.image, nextEl.fullImage);
    }
    await this.sleep(15);
    this.process();
  }

  async sleep(timer) {
    await new Promise((resolve) => setTimeout(resolve, timer * 1000));
  }

  bulkAddToQueue(elements: { image: string }[]) {
    elements.forEach((el) => this.addToQueue(el));
  }

  async addToQueue({ image }: { image: string }) {
    if (this.queue.find((x) => x.image === image)) {
      return;
    }

    try {
      const parsedEl = await getImage("images", `image-${image}`);
      if (parsedEl) {
        this.queue.push({
          image,
          timestamp: parsedEl.timestamp,
          fullImage: parsedEl.fullImage || false,
        });
      } else {
        this.queue.push({ image, timestamp: 0 });
      }
    } catch (e) {
      this.queue.push({ image, timestamp: 0 });
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new LocalImageManager();
    }
    return this.instance;
  }

  storeImageInLocalStorage(
    url: string,
    fullImage?: boolean,
    overridenUrl?: string
  ) {
    return new Promise((resolve, reject) => {});
  }
}
