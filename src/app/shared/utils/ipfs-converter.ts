export class IpfsConverter {
  public static convertIpfs(image: string) {
    return `http://ipfs.io/ipfs/${image.substring(7)}`;
  }
}
