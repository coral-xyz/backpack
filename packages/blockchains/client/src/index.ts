export default abstract class Client<T, N extends Network = Network> {
  protected Network: N;
  protected Provider: T;
}
