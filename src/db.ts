import type { Wallet, Transaction } from './types.js';
import { v4 as uuidv4 } from 'uuid';

export class InMemoryDB {
  private wallets = new Map<string, Wallet>();
  private transactions = new Map<string, Transaction[]>();

  createWallet(name: string, balance: number): Wallet {
    const id = uuidv4();
    const wallet: Wallet = { id, name, balance: Number(balance.toFixed(4)), date: new Date() };
    this.wallets.set(id, wallet);
    this.transactions.set(id, []);
    return wallet;
  }

  getWallet(id: string): Wallet | undefined {
    return this.wallets.get(id);
  }

  addTransaction(walletId: string, amount: number, description: string): Transaction | null {
    const wallet = this.wallets.get(walletId);
    if (!wallet) return null;

    const newBalance = Number((wallet.balance + amount).toFixed(4));
    if (newBalance < 0) throw new Error("Insufficient funds");

    const transaction: Transaction = {
      id: uuidv4(),
      walletId,
      amount: Math.abs(amount),
      balance: newBalance,
      description,
      date: new Date(),
      type: amount >= 0 ? 'CREDIT' : 'DEBIT'
    };

    wallet.balance = newBalance;
    this.transactions.get(walletId)?.push(transaction);
    return transaction;
  }

  getTransactions(walletId: string, skip: number, limit: number): Transaction[] {
    const list = this.transactions.get(walletId) || [];
    return list.slice().reverse().slice(skip, skip + limit);
  }
}
