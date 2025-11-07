"use client"

import React, { useMemo } from "react"
import { ChevronLeft, Download } from "lucide-react"
import { mockFees, mockStudents } from "../../services/studentMockData"

interface FeeDetailPageProps {
  feeId: string
  onBack: () => void
}

const FeeDetailPage: React.FC<FeeDetailPageProps> = ({ feeId, onBack }) => {
  const fee = mockFees.find((f) => f.id === feeId)
  const student = fee ? mockStudents.find((s) => s.id === fee.studentId) : null

  const [duration, setDuration] = React.useState<"month" | "quarter" | "half" | "year">("month")

  const filteredBreakdown = useMemo(() => {
    const monthCount = {
      month: 1,
      quarter: 3,
      half: 6,
      year: 12,
    }[duration]

    return fee?.monthlyBreakup?.slice(0, monthCount) || fee?.monthlyBreakdown?.slice(0, monthCount) || []
  }, [fee, duration])

  if (!fee || !student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Fee not found</p>
      </div>
    )
  }

  const totalBreakdownAmount = filteredBreakdown.reduce((sum, m) => sum + m.amount, 0)
  const totalBreakdownPaid = filteredBreakdown.reduce((sum, m) => sum + m.paidAmount, 0)

  const handleDownloadDetailedReceipt = () => {
    const receiptContent = `
FEE DETAIL RECEIPT
=====================================
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

STUDENT INFORMATION:
Name: ${student.firstName} ${student.lastName}
Class: ${student.class}
Section: ${student.section}
Email: ${student.email}

FEE SUMMARY:
Fee Type: ${fee.feeType}
Total Amount: $${fee.totalAmount.toLocaleString()}
Total Paid Amount: $${fee.paidAmount.toLocaleString()}
Outstanding: $${(fee.totalAmount - fee.paidAmount).toLocaleString()}
Status: ${fee.status.toUpperCase()}

MONTHLY BREAKDOWN (${duration.toUpperCase()}):
=====================================
${filteredBreakdown
  .map(
    (month) => `
${month.month}
  Amount: $${month.amount.toLocaleString()}
  Paid: $${month.paidAmount.toLocaleString()}
  Status: ${month.status.toUpperCase()}
  Due Date: ${month.dueDate}`,
  )
  .join("\n")}

TOTALS FOR SELECTED PERIOD:
Total Amount: $${totalBreakdownAmount.toLocaleString()}
Total Paid: $${totalBreakdownPaid.toLocaleString()}
Outstanding: $${(totalBreakdownAmount - totalBreakdownPaid).toLocaleString()}

=====================================
Report ID: REP-${Date.now()}
    `

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(receiptContent))
    element.setAttribute("download", `fee-detail-${student.firstName}-${Date.now()}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition">
        <ChevronLeft className="w-5 h-5" />
        Back to Fee List
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Student Information Card */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Student Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900 text-right">
                {student.firstName} {student.lastName}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Class:</span>
              <span className="font-medium text-gray-900">{student.class}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Section:</span>
              <span className="font-medium text-gray-900">{student.section}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900 text-right text-sm">{student.email}</span>
            </div>
          </div>
        </div>

        {/* Fee Summary Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Fee Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 text-sm">Fee Type</p>
              <p className="text-gray-900 font-medium mt-1">{fee.feeType}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Amount</p>
              <p className="text-blue-600 font-bold text-lg mt-1">${fee.totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Paid Amount</p>
              <p className="text-green-600 font-bold text-lg mt-1">${fee.paidAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Outstanding</p>
              <p className="text-orange-600 font-bold text-lg mt-1">
                ${(fee.totalAmount - fee.paidAmount).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Due Date</p>
              <p className="text-gray-900 font-medium mt-1">{fee.dueDate}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Status</p>
              <span
                className={`inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full ${
                  fee.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : fee.status === "partial"
                      ? "bg-blue-100 text-blue-700"
                      : fee.status === "overdue"
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                }`}
              >
                {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Fee Breakup -{" "}
            {duration === "month"
              ? "Monthly"
              : duration === "quarter"
                ? "Quarterly"
                : duration === "half"
                  ? "Half Yearly"
                  : "Yearly"}
          </h2>
          <div className="flex gap-2">
            {(["month", "quarter", "half", "year"] as const).map((dur) => (
              <button
                key={dur}
                onClick={() => setDuration(dur)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  duration === dur ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {dur === "month" ? "Month" : dur === "quarter" ? "Quarter" : dur === "half" ? "Half Year" : "Full Year"}
              </button>
            ))}
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Month</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Amount</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Paid Amount</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Outstanding</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBreakdown.map((month, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{month.month}</td>
                  <td className="px-4 py-3 text-right text-gray-900 font-medium">${month.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-medium">
                    ${month.paidAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-orange-600 font-medium">
                    ${(month.amount - month.paidAmount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        month.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : month.status === "partial"
                            ? "bg-blue-100 text-blue-700"
                            : month.status === "overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {month.status.charAt(0).toUpperCase() + month.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-bold text-gray-900">${totalBreakdownAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Paid:</span>
            <span className="font-bold text-green-600">${totalBreakdownPaid.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Outstanding:</span>
            <span className="font-bold text-orange-600">
              ${(totalBreakdownAmount - totalBreakdownPaid).toLocaleString()}
            </span>
          </div>
          <button
            onClick={handleDownloadDetailedReceipt}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default FeeDetailPage
