export interface Wallet {
  id: string;
  balance: number;
  name: string;
  date: Date;
}

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  balance: number;
  description: string;
  date: Date;
  type: 'CREDIT' | 'DEBIT';
}
