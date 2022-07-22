export class Linking {
  public static async openLink(url: string) {
    return await window.anchorUi.openLink(url);
  }
}
