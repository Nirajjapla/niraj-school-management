import React, { useMemo, useState } from 'react';
import { Plus, Search, DollarSign, Eye, X } from 'lucide-react';
import { mockFees as initialFees, mockStudents } from '../services/mockData';

interface Fee {
  id: string;
  studentId: string;
  feeType: string;
  totalAmount: number; // renamed from amount
  dueDate: string;
  paidAmount: number; // already present
  paidDate: string | null;
  status: string;
  // optional fields
  class?: string;
  section?: string;
  // store reminders
  lastReminderSent?: string | null;
  // fee breakup for detail page
  breakup?: { label: string; amount: number }[];
}

const PAGE_SIZE = 10;

const FeeManagement: React.FC = () => {
  // map initial data to new shape (safe migration)
  const migrated: Fee[] = initialFees.map(f => ({
    ...f,
    totalAmount: (f as any).amount ?? (f.totalAmount ?? 0),
    class: (f as any).class ?? (f as any).grade ?? 'Unassigned',
    section: (f as any).section ?? 'A',
    lastReminderSent: (f as any).lastReminderSent ?? null,
    breakup: (f as any).breakup ?? [
      { label: 'Tuition', amount: ((f as any).tuition ?? (f.amount ?? 0) * 0.7) },
      { label: 'Transport', amount: ((f as any).transport ?? 0) },
      { label: 'Others', amount: ((f as any).others ?? 0) }
    ]
  }));

  const [fees, setFees] = useState<Fee[]>(migrated);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentFee, setCurrentFee] = useState<Fee | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState<null | Fee>(null);
  const [timeDuration, setTimeDuration] = useState<'month' | 'quarter' | 'half' | 'year'>('month');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-indexed

  const getStudentName = (studentId: string) => {
    const student = mockStudents.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown';
  };

  // derive distinct classes/sections from students and fees
  const classes = useMemo(() => {
    const set = new Set<string>();
    mockStudents.forEach(s => set.add((s as any).class ?? (s as any).grade ?? 'Unassigned'));
    fees.forEach(f => f.class && set.add(f.class));
    return ['All', ...Array.from(set)];
  }, [fees]);

  const sections = useMemo(() => {
    const set = new Set<string>();
    mockStudents.forEach(s => set.add((s as any).section ?? 'A'));
    fees.forEach(f => f.section && set.add(f.section));
    return ['All', ...Array.from(set)];
  }, [fees]);

  // filtering by search, class, section
  const filteredFees = fees.filter(fee => {
    const studentName = getStudentName(fee.studentId);
    const matchesSearch = (
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.feeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesClass = selectedClass === 'All' || fee.class === selectedClass;
    const matchesSection = selectedSection === 'All' || fee.section === selectedSection;

    return matchesSearch && matchesClass && matchesSection;
  });

  // pagination
  const totalPages = Math.max(1, Math.ceil(filteredFees.length / PAGE_SIZE));
  const paginated = filteredFees.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // monthly statistics (based on selectedMonth)
  const monthlyTotals = useMemo(() => {
    const byMonth: Record<number, { total: number; collected: number; pending: number }> = {};
    fees.forEach(f => {
      const d = new Date(f.dueDate);
      const m = d.getMonth();
      byMonth[m] ??= { total: 0, collected: 0, pending: 0 };
      byMonth[m].total += f.totalAmount;
      byMonth[m].collected += f.paidAmount;
      byMonth[m].pending = byMonth[m].total - byMonth[m].collected;
    });
    return byMonth;
  }, [fees]);

  const totalsForSelectedMonth = monthlyTotals[selectedMonth] ?? { total: 0, collected: 0, pending: 0 };

  const handlePayment = (fee: Fee) => {
    setCurrentFee(fee);
    setPaymentAmount((fee.totalAmount - fee.paidAmount).toString());
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFee) return;

    const payment = parseFloat(paymentAmount);
    const newPaidAmount = Math.min(currentFee.paidAmount + payment, currentFee.totalAmount);
    const newStatus = newPaidAmount >= currentFee.totalAmount ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending';

    setFees(prev => prev.map(f =>
      f.id === currentFee.id
        ? { ...f, paidAmount: newPaidAmount, paidDate: new Date().toISOString().split('T')[0], status: newStatus }
        : f
    ));

    setShowPaymentModal(false);
    setCurrentFee(null);
    setPaymentAmount('');
  };

  // totals (overall monthly view default, but show aggregated totals)
  const totalFees = fees.reduce((sum, fee) => sum + fee.totalAmount, 0);
  const collectedFees = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);
  const pendingFees = totalFees - collectedFees;

  // download receipt - create a small HTML receipt and trigger download
  const downloadReceipt = (fee: Fee) => {
    const studentName = getStudentName(fee.studentId);
    const receiptHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Receipt-${fee.id}</title></head><body style="font-family:Arial;padding:24px;">` +
      `<h2>Payment Receipt</h2>` +
      `<p><strong>Receipt ID:</strong> ${fee.id}</p>` +
      `<p><strong>Student:</strong> ${studentName}</p>` +
      `<p><strong>Class:</strong> ${fee.class ?? 'N/A'} | <strong>Section:</strong> ${fee.section ?? 'N/A'}</p>` +
      `<p><strong>Fee Type:</strong> ${fee.feeType}</p>` +
      `<p><strong>Total Amount:</strong> ${fee.totalAmount.toLocaleString()}</p>` +
      `<p><strong>Paid Amount:</strong> ${fee.paidAmount.toLocaleString()}</p>` +
      `<p><strong>Paid Date:</strong> ${fee.paidDate ?? '-'}</p>` +
      `<hr/>` +
      `<p>Generated: ${new Date().toLocaleString()}</p>` +
      `</body></html>`;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${fee.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // send reminders to pending students (simulated) - updates lastReminderSent
  const sendReminders = () => {
    const now = new Date().toISOString();
    let count = 0;
    setFees(prev => prev.map(f => {
      if (f.status !== 'paid') {
        count++;
        return { ...f, lastReminderSent: now };
      }
      return f;
    }));
    alert(`Reminders sent to ${count} students (simulated)`);
  };

  // detail aggregation helper for a fee - supports durations
  const aggregateForDuration = (fee: Fee, duration: typeof timeDuration) => {
    // for simplicity we use breakup items and repeat based on duration
    // month -> show breakup as-is
    // quarter -> aggregate 3 months (we multiply amounts by 3)
    // half -> 6 months
    // year -> 12 months
    const multiplier = duration === 'month' ? 1 : duration === 'quarter' ? 3 : duration === 'half' ? 6 : 12;
    return fee.breakup?.map(b => ({ label: b.label, amount: b.amount * multiplier })) ?? [];
  };

  // helpers for friendly detail modal layout
  const DetailRow: React.FC<{label: string; value: React.ReactNode}> = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <div className="text-gray-600">{label}</div>
      <div className="font-medium text-gray-800 text-right">{value}</div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Fee Management</h1>
        <p className="text-gray-600">Track and manage student fee payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Monthly Totals ({new Date(0, selectedMonth).toLocaleString('default', { month: 'long' })})</p>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">${totalsForSelectedMonth.total.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Collected (selected month)</p>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">${totalsForSelectedMonth.collected.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Pending (selected month)</p>
            <DollarSign className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">${totalsForSelectedMonth.pending.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 items-center">
          <div className="relative max-w-md flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search fees..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 block">Class</label>
            <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border rounded-lg">
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 block">Section</label>
            <select value={selectedSection} onChange={(e) => { setSelectedSection(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border rounded-lg">
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 block">Month</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="px-3 py-2 border rounded-lg">
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex items-end gap-3">
            <button onClick={sendReminders} className="px-3 py-2 bg-orange-500 text-white rounded-lg">Send Reminders</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginated.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{getStudentName(fee.studentId)}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{fee.class}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{fee.section}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 capitalize">{fee.feeType}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">${fee.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">${fee.paidAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{fee.dueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      fee.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : fee.status === 'partial'
                        ? 'bg-blue-100 text-blue-700'
                        : fee.status === 'overdue'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {fee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {fee.status !== 'paid' && (
                      <button
                        onClick={() => handlePayment(fee)}
                        className="px-3 py-1 bg-[#4e74f9] text-white text-sm rounded-lg hover:bg-[#3d5fd8] transition"
                      >
                        Pay Now
                      </button>
                    )}
                    <button onClick={() => setShowDetailModal(fee)} className="px-3 py-1 border rounded-lg text-sm">Details</button>
                    <button onClick={() => downloadReceipt(fee)} className="px-3 py-1 border rounded-lg text-sm">Download Receipt</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* pagination controls */}
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Showing {(currentPage-1)*PAGE_SIZE + 1} - {Math.min(currentPage*PAGE_SIZE, filteredFees.length)} of {filteredFees.length}</div>
          <div className="flex gap-2">
            <button disabled={currentPage===1} onClick={() => setCurrentPage(p => Math.max(1, p-1))} className="px-3 py-1 border rounded">Prev</button>
            <div className="px-3 py-1 border rounded">Page {currentPage} / {totalPages}</div>
            <button disabled={currentPage===totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} className="px-3 py-1 border rounded">Next</button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && currentFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Pay Now</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Student</p>
                <p className="font-medium text-gray-800">{getStudentName(currentFee.studentId)}</p>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Class</p>
                  <p className="font-medium text-gray-800">{currentFee.class}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Section</p>
                  <p className="font-medium text-gray-800">{currentFee.section}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Fee Type</p>
                <p className="font-medium text-gray-800 capitalize">{currentFee.feeType}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-medium text-gray-800">${currentFee.totalAmount.toLocaleString()}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Already Paid</p>
                <p className="font-medium text-gray-800">${currentFee.paidAmount.toLocaleString()}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="font-medium text-orange-600">${(currentFee.totalAmount - currentFee.paidAmount).toLocaleString()}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="0"
                  max={currentFee.totalAmount - currentFee.paidAmount}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4e74f9] text-white rounded-lg hover:bg-[#3d5fd8] transition"
                >
                  Pay Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Fee Details</h2>
              <button onClick={() => setShowDetailModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailRow label="Student" value={getStudentName(showDetailModal.studentId)} />
                <DetailRow label="Class / Section" value={`${showDetailModal.class} / ${showDetailModal.section}`} />
                <DetailRow label="Fee Type" value={showDetailModal.feeType} />
                <DetailRow label="Due Date" value={showDetailModal.dueDate} />
                <DetailRow label="Total Amount" value={`$${showDetailModal.totalAmount.toLocaleString()}`} />
                <DetailRow label="Paid Amount" value={`$${showDetailModal.paidAmount.toLocaleString()}`} />
                <DetailRow label="Status" value={showDetailModal.status} />
              </div>

              <div>
                <div className="mb-4">
                  <label className="text-sm text-gray-600 block">Time Duration</label>
                  <select value={timeDuration} onChange={(e) => setTimeDuration(e.target.value as any)} className="px-3 py-2 border rounded-lg">
                    <option value="month">Month</option>
                    <option value="quarter">Quarter</option>
                    <option value="half">Half Year</option>
                    <option value="year">Full Year</option>
                  </select>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Fee Breakup ({timeDuration})</div>
                  {aggregateForDuration(showDetailModal, timeDuration).map(item => (
                    <div key={item.label} className="flex justify-between py-2 border-b border-gray-100">
                      <div className="text-gray-700">{item.label}</div>
                      <div className="font-medium">${item.amount.toLocaleString()}</div>
                    </div>
                  ))}

                  <div className="flex justify-between mt-4 pt-2 border-t">
                    <div className="text-gray-600">Total</div>
                    <div className="font-bold">${(aggregateForDuration(showDetailModal, timeDuration).reduce((s,a)=>s+a.amount,0)).toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <button onClick={() => downloadReceipt(showDetailModal)} className="px-4 py-2 bg-[#4e74f9] text-white rounded-lg">Download Receipt</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
