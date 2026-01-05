import { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  History, 
  Loader2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldAlert, 
  PiggyBank, 
  Minus, 
  Plus, 
  Wallet,
  Copy, 
  Check 
} from 'lucide-react';

const API = '';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [setupBalance, setSetupBalance] = useState('0');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [txType, setTxType] = useState<'credit' | 'debit'>('debit');

  useEffect(() => {
    document.title = "WalletPro | Dashboard";
  }, []);

  const fetchWalletData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const [wRes, tRes] = await Promise.all([
        fetch(`${API}/wallet/${id}`),
        fetch(`${API}/transactions?walletId=${id}`)
      ]);
      const wData = await wRes.json();
      const tData = await tRes.json();
      setWallet(wData);
      setTransactions(tData || []);
    } catch (err) {
      setError("Cloud sync failed. Check API connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (wallet?.id) fetchWalletData(wallet.id);
  }, [activeTab, wallet?.id, fetchWalletData]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = async () => {
    setError(null);
    const val = parseFloat(amount);
    
    if (!val || val <= 0) return setError("Please enter a valid amount.");
    if (txType === 'debit' && val > wallet.balance) return setError("Insufficient funds for this debit.");

    setLoading(true);
    try {
      const apiAmount = txType === 'debit' ? -Math.abs(val) : Math.abs(val);

      const response = await fetch(`${API}/transact/${wallet.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: apiAmount, 
          description: reason || (txType === 'credit' ? 'Deposit' : 'Withdrawal') 
        })
      });

      if (!response.ok) throw new Error();

      setAmount(''); 
      setReason('');
      await fetchWalletData(wallet.id);
    } catch (err) {
      setError("Transaction rejected. Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
      
      <aside className="w-64 lg:w-72 bg-[#020617] text-white flex flex-col shrink-0 border-r border-slate-800">
        <div className="py-10 px-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shrink-0">
            <Wallet size={24} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight truncate">Wallet<span className="text-indigo-400">Pro</span></span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 shadow-lg text-white' : 'text-slate-500 hover:bg-slate-900 hover:text-white'}`}>
            <LayoutDashboard size={20}/> <span>Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'history' ? 'bg-indigo-600 shadow-lg text-white' : 'text-slate-500 hover:bg-slate-900 hover:text-white'}`}>
            <History size={20}/> <span>Ledger</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {!wallet ? (
          <div className="h-full flex items-center justify-center p-6 bg-white">
            <div className="w-full max-w-md text-center animate-in fade-in zoom-in duration-500">
              <PiggyBank size={64} className="mx-auto text-indigo-600 mb-6" />
              <h2 className="text-3xl font-black mb-2 tracking-tight">Setup WalletPro</h2>
              <p className="text-slate-400 mb-8 font-medium">Initialize your account with a starting balance</p>
              <div className="relative mb-6">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold">₹</span>
                <input type="number" value={setupBalance} onChange={(e) => setSetupBalance(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-10 pr-6 text-3xl font-black outline-none focus:border-indigo-600 transition-all" />
              </div>
              <button onClick={async () => {
                setLoading(true);
                const res = await fetch(`${API}/setup`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: "Primary", balance: parseFloat(setupBalance) || 0 })});
                setWallet(await res.json());
                setLoading(false);
              }} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                {loading ? <Loader2 className="animate-spin mx-auto"/> : "Confirm & Open Vault"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <header className="h-20 bg-white border-b border-slate-200 flex items-center px-8 justify-between shrink-0">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">{activeTab}</h2>
              
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 pl-4 pr-2 py-1.5 rounded-xl max-w-[220px] md:max-w-xs group transition-all hover:border-indigo-200">
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Vault ID</p>
                  <p className="text-xs font-mono font-bold text-slate-600 truncate">{wallet.id}</p>
                </div>
                <button 
                  onClick={() => handleCopy(wallet.id)}
                  className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-all shrink-0"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-10">
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                  
                  <div className="xl:col-span-7 space-y-10">
                    <div className="bg-[#020617] rounded-[48px] p-10 lg:p-16 text-white shadow-2xl relative overflow-hidden">
                       <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-4">Total Liquidity</p>
                       <h3 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none">
                         ₹{wallet.balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                       </h3>
                    </div>

                    <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-slate-200 shadow-sm space-y-10">
                       <div className="flex gap-4">
                         <button onClick={() => setTxType('debit')} className={`flex-1 py-4 rounded-2xl font-black text-sm tracking-widest transition-all border-2 ${txType === 'debit' ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-lg shadow-rose-100' : 'border-slate-50 text-slate-400'}`}>DEBIT FLOW</button>
                         <button onClick={() => setTxType('credit')} className={`flex-1 py-4 rounded-2xl font-black text-sm tracking-widest transition-all border-2 ${txType === 'credit' ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-100' : 'border-slate-50 text-slate-400'}`}>CREDIT FLOW</button>
                       </div>

                       {error && <div className="p-5 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 font-bold flex items-center gap-3 animate-pulse"><ShieldAlert size={20}/> {error}</div>}

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Value (₹)</label>
                           <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 rounded-2xl py-5 px-6 text-4xl font-black outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all" />
                         </div>
                         <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Description</label>
                           <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Rent, Salary..." className="w-full bg-slate-50 rounded-2xl py-5 px-6 text-xl font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all" />
                         </div>
                       </div>

                       <button onClick={handleExecute} className={`w-full py-6 rounded-[24px] font-black text-2xl text-white shadow-2xl transition-all active:scale-95 ${txType === 'credit' ? 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700' : 'bg-rose-600 shadow-rose-200 hover:bg-rose-700'}`}>
                         {loading ? <Loader2 className="animate-spin mx-auto"/> : `PROCESS ${txType.toUpperCase()}`}
                       </button>
                    </div>
                  </div>

                  <div className="xl:col-span-5 bg-white rounded-[40px] border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
                    <div className="p-8 border-b border-slate-100 font-black text-slate-400 uppercase tracking-widest text-xs">Recent Activity</div>
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                      {transactions.length === 0 && <div className="p-10 text-center text-slate-300 font-bold italic">No transactions yet</div>}
                      {transactions.map((tx) => {
                        const isDebit = tx.type === 'DEBIT' || tx.amount < 0;
                        return (
                          <div key={tx.id} className="p-6 flex justify-between items-center hover:bg-slate-50/50 transition-all group">
                            <div className="flex items-center gap-5 min-w-0">
                              <div className={`p-3 rounded-xl shrink-0 ${isDebit ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                  {isDebit ? <Minus size={20} strokeWidth={3}/> : <Plus size={20} strokeWidth={3}/>}
                              </div>
                              <div className="truncate">
                                <div className="font-bold text-slate-800 truncate text-sm leading-tight">{tx.description}</div>
                                <div className="text-[10px] text-slate-400 font-mono mt-1">Ref: {tx.id.slice(0,8)}</div>
                              </div>
                            </div>
                            <p className={`font-black text-lg ml-4 shrink-0 ${isDebit ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {isDebit ? '-' : '+'}₹{Math.abs(tx.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                      <thead className="bg-[#020617] text-white font-black text-[10px] uppercase tracking-[0.2em]">
                        <tr>
                          <th className="px-10 py-8">Flow Type</th>
                          <th className="px-10 py-8">Unique ID</th>
                          <th className="px-10 py-8">Reference Note</th>
                          <th className="px-10 py-8 text-right">Value Change</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transactions.map((tx) => {
                          const isDebit = tx.type === 'DEBIT' || tx.amount < 0;
                          return (
                            <tr key={tx.id} className="hover:bg-slate-50 transition-all group">
                              <td className="px-10 py-8">
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black border ${isDebit ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                  {isDebit ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>} {isDebit ? 'DEBIT' : 'CREDIT'}
                                </span>
                              </td>
                              <td className="px-10 py-8 font-mono text-[11px] text-slate-400 group-hover:text-slate-600">{tx.id}</td>
                              <td className="px-10 py-8 font-bold text-slate-800 text-lg">{tx.description}</td>
                              <td className={`px-10 py-8 text-right font-black text-2xl ${isDebit ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {isDebit ? '-' : '+'}₹{Math.abs(tx.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
