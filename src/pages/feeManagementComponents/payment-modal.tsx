import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, CheckCircle2, CreditCard, FileText } from 'lucide-react';
import { formatRupee } from '../../styles/colors';
import { StudentFeeRecord } from '../../services/centralData';

interface PaymentModalProps {
  fee: StudentFeeRecord;
  onClose: () => void;
  onSubmit: (amount: number, remarks?: string) => void;
  studentName: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ fee, onClose, onSubmit, studentName }) => {
  const outstanding = Math.max(0, fee.totalAmount - fee.paidAmount);
  const [paymentAmount, setPaymentAmount] = useState(outstanding.toString());
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Online / UPI' | 'Cheque' | 'Bank Transfer'>('Online / UPI');
  const [remarks, setRemarks] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptId, setReceiptId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (amount > 0) {
      const generatedId = `RCP-2026-${Date.now().toString().slice(-6)}`;
      setReceiptId(generatedId);
      onSubmit(amount, remarks);
      setShowReceipt(true);
    }
  };

  const generateReceipt = () => {
    const amount = parseFloat(paymentAmount);
    const newPaidAmount = fee.paidAmount + amount;
    const receiptContent = `
=====================================================
            SCHOOL ERP - FEE PAYMENT RECEIPT
=====================================================
Receipt ID: ${receiptId}
Date: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString()}

STUDENT INFORMATION:
Name: ${studentName}
Class & Section: ${fee.class} - ${fee.section}
Student Category: ${fee.category === 'reservation' ? 'Reservation / Concession' : 'Normal Student'}
Fee Type: ${fee.feeType}

PAYMENT DETAILS:
Payment Method: ${paymentMethod}
Total Amount: ${formatRupee(fee.totalAmount)}
Previously Paid: ${formatRupee(fee.paidAmount)}
Current Amount Paid: ${formatRupee(amount)}
Total Paid to Date: ${formatRupee(newPaidAmount)}
Remaining Balance: ${formatRupee(Math.max(0, fee.totalAmount - newPaidAmount))}

Status: ${newPaidAmount >= fee.totalAmount ? 'FULLY PAID' : 'PARTIAL PAYMENT'}
Remarks: ${remarks || 'Fee received with thanks'}

=====================================================
This is a computer generated receipt. Signature not required.
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
    element.setAttribute('download', `fee-receipt-${studentName.replace(/\s+/g, '_')}-${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (showReceipt) {
    return createPortal(
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
          <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Recorded</h2>
            <button
              onClick={() => {
                setShowReceipt(false);
                onClose();
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Successful!</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">Receipt ID: {receiptId}</p>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 space-y-2 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">Student:</span>
                <span className="text-gray-900 dark:text-white">{studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">Amount Paid:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{formatRupee(parseFloat(paymentAmount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">Payment Mode:</span>
                <span className="text-gray-800 dark:text-slate-200">{paymentMethod}</span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
            <button
              onClick={() => {
                setShowReceipt(false);
                onClose();
              }}
              className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium transition"
            >
              Close
            </button>
            <button
              onClick={generateReceipt}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Record Fee Payment</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Composite Fee Collection</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
              Required fields are marked with an asterisk (<span className="text-red-500">*</span>)
            </p>

            {/* Section 1: Student Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 pb-2">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                <span>Student Summary</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl space-y-2 text-xs border border-slate-100 dark:border-slate-700/50">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Student Name:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Class & Section:</span>
                  <span className="text-gray-800 dark:text-slate-200">Class {fee.class} - {fee.section}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Category:</span>
                  <span className="text-gray-800 dark:text-slate-200">
                    {fee.category === 'reservation' ? 'Reservation / Concession' : 'Normal Student'}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-slate-700">
                  <span className="text-gray-500 dark:text-slate-400">Total Applicable Fee:</span>
                  <span className="text-gray-900 dark:text-white">{formatRupee(fee.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Outstanding Balance:</span>
                  <span className="text-gray-900 dark:text-white">{formatRupee(outstanding)}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Payment Collection */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 pb-2">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                <span>Payment Details</span>
              </div>

              {/* Payment Frequency / Installment Quick Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                  Quick Installment Selection
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Monthly', calc: Math.ceil(fee.totalAmount / 12) },
                    { label: 'Quarterly', calc: Math.ceil(fee.totalAmount / 4) },
                    { label: 'Half-Year', calc: Math.ceil(fee.totalAmount / 2) },
                    { label: 'Full Balance', calc: outstanding }
                  ].map((freq) => {
                    const targetAmt = Math.min(outstanding, freq.calc);
                    const isSelected = parseFloat(paymentAmount) === targetAmt;
                    return (
                      <button
                        key={freq.label}
                        type="button"
                        onClick={() => setPaymentAmount(targetAmt.toString())}
                        className={`px-2 py-1.5 rounded-lg border text-xs font-medium transition text-center ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        <div className="text-[10px] opacity-80">{freq.label}</div>
                        <div>{formatRupee(targetAmt)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Payment Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    min="1"
                    max={outstanding}
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
                    required
                  />
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">
                    Max balance: {formatRupee(outstanding)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Payment Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
                  >
                    <option value="Online / UPI">Online / UPI (Google Pay, PhonePe, Paytm)</option>
                    <option value="Cash">Cash at Counter</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Transaction Ref, Bank Name"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition shadow-sm"
            >
              Confirm & Collect Payment
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PaymentModal;
