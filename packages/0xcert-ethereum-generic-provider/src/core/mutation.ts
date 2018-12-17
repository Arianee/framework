import { EventEmitter } from 'events';
import { MutationBase } from '@0xcert/scaffold';
import { normalizeAddress } from '@0xcert/ethereum-utils/dist/lib/normalize-address';
import { MutationEvent } from './types';

/**
 * Possible mutation statuses.
 */
export enum MutationStatus {
  INITIALIZED = 0,
  PENDING = 1,
  RESOLVED = 2,
}

/**
 * 
 */
export class Mutation extends EventEmitter implements MutationBase {
  protected $id: string;
  protected $confirmations: number = 0;
  protected $senderId: string;
  protected $receiverId: string;
  protected $provider: any;
  protected $timer: any = null;
  protected $status: MutationStatus = MutationStatus.INITIALIZED;

  /**
   * Initialize mutation.
   * @param provider Provider class with which we comunicate with blockchain.
   * @param id Smart contract address on which a mutation will be performed.
   */
  public constructor(provider: any, id: string) {
    super();

    this.$id = normalizeAddress(id);
    this.$provider = provider;
  }

  /**
   * Gets smart contract address.
   */
  public get id() {
    return this.$id;
  }

  /**
   * Get provider intance.
   */
  public get provider() {
    return this.$provider;
  }

  /**
   * Gets the number of confirmations of mutation.
   */
  public get confirmations() {
    return this.$confirmations;
  }

  /**
   * Gets the sending address.
   */
  public get senderId() {
    return this.$senderId;
  }

  /**
   * Gets the receiving address.
   */
  public get receiverId() {
    return this.$receiverId;
  }

  /**
   * Checks if mutation in pending.
   */
  public isPending() {
    return this.$status === MutationStatus.PENDING;
  }

  /**
   * Checks if mutation is resolved.
   */
  public isResolved() {
    return this.$status === MutationStatus.RESOLVED;
  }

  /**
   * Event emmiter.
   */
  public emit(event: MutationEvent.CONFIRM, mutation: Mutation);
  public emit(event: MutationEvent.RESOLVE, mutation: Mutation);
  public emit(event: MutationEvent.ERROR, error: any);
  public emit(...args) {
    return super.emit.call(this, ...args);
  }

  /**
   * Attaches on mutation events.
   */
  public on(event: MutationEvent.CONFIRM, handler: (m: Mutation) => any);
  public on(event: MutationEvent.RESOLVE, handler: (m: Mutation) => any);
  public on(event: MutationEvent.ERROR, handler: (e: any) => any);
  public on(...args) {
    return super.on.call(this, ...args);
  }

  /**
   * Once handler.
   */
  public once(event: MutationEvent.CONFIRM, handler: (m: Mutation) => any);
  public once(event: MutationEvent.RESOLVE, handler: (m: Mutation) => any);
  public once(event: MutationEvent.ERROR, handler: (e: any) => any);
  public once(...args) {
    return super.once.call(this, ...args);
  }

  /**
   * Dettaches from mutation events. 
   */
  public off(event: MutationEvent, handler?: () => any) {
    if (handler) {
      return super.off(event, handler);
    }
    else {
      return super.removeAllListeners(event);
    }
  }

  /**
   * Waits until mutation is resolved (mutation reaches the specified number of confirmations).
   */
  public async resolve() {
    const start = this.$status === MutationStatus.INITIALIZED;

    if (this.isResolved()) {
      return this;
    }
    else {
      this.$status = MutationStatus.PENDING;
    }

    await new Promise((resolve, reject) => {
      if (!this.isResolved()) {
        this.once(MutationEvent.RESOLVE, () => resolve());
        this.once(MutationEvent.ERROR, (err) => reject(err));
      }
      else {
        resolve();
      }
      if (start) {
        this.loopUntilResolved();
      }
    });

    return this;
  }

  /**
   * 
   */
  public forget() {
    if (this.$timer) {
      clearTimeout(this.$timer);
    }

    return this;
  }

  /**
   * Helper methods for waiting to resolve mutation.
   */
  protected async loopUntilResolved() {
    const tx = await this.getTransactionObject();
    if (!tx) {
      return this.emit(MutationEvent.ERROR, new Error('Mutation not found (1)'));
    }
    else if (!tx.to || tx.to === '0x0') {
      tx.to = await this.getTransactionReceipt().then((r) => r.contractAddress);
    }

    this.$senderId = normalizeAddress(tx.from);
    this.$receiverId = normalizeAddress(tx.to);
    this.$confirmations = await this.getLastBlock().then((lastBlock) => lastBlock - parseInt(tx.blockNumber || lastBlock));

    if (this.$confirmations >= this.$provider.requiredConfirmations) {
      this.$status = MutationStatus.RESOLVED;
      this.emit(MutationEvent.RESOLVE, this);
    }
    else {
      this.emit(MutationEvent.CONFIRM, this);
      this.$timer = setTimeout(this.loopUntilResolved.bind(this), 14000);
    }
  }

  /**
   * Gets transaction data.
   */
  protected async getTransactionObject() {
    const res = await this.$provider.post({
      method: 'eth_getTransactionByHash',
      params: [this.id],
    });
    return res.result;
  }

  /**
   * Gets transaction receipt.
   */
  protected async getTransactionReceipt() {
    const res = await this.$provider.post({
      method: 'eth_getTransactionReceipt',
      params: [this.id],
    });
    return res.result;
  }

  /**
   * Gets the latest block number.
   */
  protected async getLastBlock() {
    const res = await this.$provider.post({
      method: 'eth_blockNumber',
    });
    return parseInt(res.result);
  }

}