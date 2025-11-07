"use client"

import type React from "react"
import { useState } from "react"
import { X, Download } from "lucide-react"
import type { Fee } from "../../services/studentMockData"

interface PaymentModalProps {
  fee: Fee
  onClose: () => void
  onSubmit: (amount: number) => void
  studentName: string
}

const PaymentModal: React.FC<PaymentModalProps> = ({ fee, onClose, onSubmit, studentName }) => {
  const [paymentAmount, setPaymentAmount] = useState((fee.totalAmount - fee.paidAmount).toString())
  const [showReceipt, setShowReceipt] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number.parseFloat(paymentAmount)
    if (amount > 0) {
      onSubmit(amount)
      setShowReceipt(true)
    }
  }

  const generateReceipt = () => {
    const amount = Number.parseFloat(paymentAmount)
    const newPaidAmount = fee.paidAmount + amount
    const receiptContent = `
PAYMENT RECEIPT
=====================================
Date: ${new Date().toLocaleDateString()}

Student Name: ${studentName}
Class: ${fee.class}
Section: ${fee.section}
Fee Type: ${fee.feeType}

Payment Details:
Total Amount: $${fee.totalAmount.toLocaleString()}
Previous Paid: $${fee.paidAmount.toLocaleString()}
Payment Amount: $${amount.toLocaleString()}
Total Paid: $${newPaidAmount.toLocaleString()}

Receipt ID: RCP-${Date.now()}
Status: ${newPaidAmount >= fee.totalAmount ? "FULLY PAID" : "PARTIAL PAYMENT"}

=====================================
Thank you for your payment!
    `

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(receiptContent))
    element.setAttribute("download", `receipt-${studentName}-${Date.now()}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (showReceipt) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h2 className="text-2xl font-bold text-green-600 mb-4 text-center">Payment Successful!</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Amount Paid:</span> ${Number.parseFloat(paymentAmount).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Receipt ID:</span> RCP-{Date.now()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowReceipt(false)
                onClose()
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Close
            </button>
            <button
              onClick={generateReceipt}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Pay Now</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4 mb-6">
          <div className="flex">
            <div className="w-1/2">
              <p className="text-sm text-gray-600">Student</p>
              <p className="font-medium text-gray-900">{studentName}</p>
            </div>

            <div className="w-1/2">
              <p className="text-sm text-gray-600">Class - Section</p>
              <p className="font-medium text-gray-900">
                {fee.class} - {fee.section}
              </p>
            </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-blue-600">${fee.totalAmount.toLocaleString()}</p>
            </div>

            {/* <div>
              <p className="text-sm text-gray-600">Already Paid Amount</p>
              <p className="font-medium text-green-600">${fee.paidAmount.toLocaleString()}</p>
            </div> */}

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-gray-600">Remaining Amount</p>
              <p className="text-lg font-bold text-orange-600">
                ${(fee.totalAmount - fee.paidAmount).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              min="0"
              max={fee.totalAmount - fee.paidAmount}
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Max: ${(fee.totalAmount - fee.paidAmount).toLocaleString()}</p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentModal
