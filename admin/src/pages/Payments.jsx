import { motion } from 'framer-motion';
import { CreditCard, DollarSign, DownloadCloud, CheckCircle } from 'lucide-react';

export default function Payments() {
  const transactions = [
    { id: 'TXN-001', user: 'john.doe@example.com', plan: 'Pro', amount: 15.00, status: 'Completed', date: '2026-05-25' },
    { id: 'TXN-002', user: 'jane.smith@example.com', plan: 'Basic', amount: 5.00, status: 'Completed', date: '2026-05-24' },
    { id: 'TXN-003', user: 'mike.jones@example.com', plan: 'Enterprise', amount: 99.00, status: 'Pending', date: '2026-05-24' },
    { id: 'TXN-004', user: 'sara.williams@example.com', plan: 'Pro', amount: 15.00, status: 'Failed', date: '2026-05-23' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Payments & Subscriptions</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Manage billing, subscription tiers, and transaction history.</p>
        </div>
        <button className="bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--bg-card)] transition-all shadow-sm flex items-center gap-2">
          <DownloadCloud size={18} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><DollarSign size={24} /></div>
          </div>
          <h3 className="text-3xl font-bold text-[var(--text-main)] mb-1">$33,800</h3>
          <p className="text-sm font-medium text-[var(--text-muted)]">Monthly Recurring Revenue</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500"><CreditCard size={24} /></div>
          </div>
          <h3 className="text-3xl font-bold text-[var(--text-main)] mb-1">1,420</h3>
          <p className="text-sm font-medium text-[var(--text-muted)]">Active Subscriptions</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-pink-500/10 text-pink-500"><CheckCircle size={24} /></div>
          </div>
          <h3 className="text-3xl font-bold text-[var(--text-main)] mb-1">2.4%</h3>
          <p className="text-sm font-medium text-[var(--text-muted)]">Churn Rate</p>
        </div>
      </div>

      <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden border border-[var(--border-subtle)] shadow-sm">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <h3 className="text-lg font-bold text-[var(--text-main)]">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-hover)]/50">
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr key={index} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-main)]">{txn.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">{txn.user}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium border border-[var(--border-subtle)] px-2.5 py-1 rounded-md bg-[var(--bg-card)]">{txn.plan}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[var(--text-main)]">${txn.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      txn.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                      txn.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">{txn.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
