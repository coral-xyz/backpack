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

  addToQueue({ image }: { image: string }) {
    if (this.queue.find((x) => x.image === image)) {
      return;
    }

    try {
      const imageEl = localStorage.getItem(`image-${image}`) || "";
      const parsedEl = JSON.parse(imageEl);
      if (parsedEl) {
        this.queue.push({
          image,
          timestamp: parsedEl.timestamp,
          fullImage: parsedEl.fullImage || false,
        });
      }
    } catch (e) {
      this.queue.push({ image, timestamp: 0 });
    }
  }

  static getInstance() {
    return new LocalImageManager();
  }

  storeImageInLocalStorage(
    url: string,
    fullImage?: boolean,
    overridenUrl?: string
  ) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      //@ts-ignore
      const context = canvas.getContext("2d");
      const base_image = new Image();
      base_image.crossOrigin = "anonymous";
      base_image.onload = function () {
        const aspectRatio = base_image.width / base_image.height;
        canvas.width = fullImage ? base_image.width : 200;
        canvas.height = fullImage ? base_image.height : 200 / aspectRatio;
        //@ts-ignore
        context.clearRect(0, 0, canvas.width, canvas.height);
        //@ts-ignore
        context.drawImage(base_image, 0, 0, canvas.width, canvas.height);
        // @ts-ignore
        const dataURL = canvas.toDataURL("image/webp");
        localStorage.setItem(
          `image-${url}`,
          JSON.stringify({
            url: dataURL,
            timestamp: new Date().getTime(),
            fullImage: fullImage ? true : false,
          })
        );
        resolve("");
      };
      base_image.src = overridenUrl || url;
    });
  }
}
