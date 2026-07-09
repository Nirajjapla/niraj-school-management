"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Search, DollarSign, Eye, Mail, ChevronLeft, ChevronRight } from "lucide-react"
import { type Fee } from "../../services/studentMockData"
import { feeApi, studentApi } from "../../services/api"
import PaymentModal from "./payment-modal"

interface FeeListProps {
  onSelectFee: (feeId: string) => void
}

const FeeList: React.FC<FeeListProps> = ({ onSelectFee }) => {
  const [fees, setFees] = useState<Fee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentFee, setCurrentFee] = useState<Fee | null>(null)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [studentNames, setStudentNames] = useState<Record<string, string>>({})

  const itemsPerPage = 10

  const fetchFees = async () => {
    try {
      const dbFees = await feeApi.getFees();
      
      const mapped = dbFees.map((f: any) => {
        return {
          id: String(f.id),
          studentId: String(f.student_id),
          class: f.student?.class?.name || '10',
          section: f.student?.section?.name || 'A',
          feeType: 'Tuition',
          totalAmount: Number(f.amount),
          paidAmount: f.status === 'paid' ? Number(f.amount) : f.status === 'partial' ? Number(f.amount) / 2 : 0,
          dueDate: f.due_date,
          paidDate: f.status === 'paid' ? f.updated_at?.split('T')[0] : null,
          status: f.status === 'unpaid' ? 'pending' : f.status,
          monthlyBreakdown: []
        };
      });

      // Get all student names
      const names: Record<string, string> = {};
      dbFees.forEach((f: any) => {
        if (f.student?.user?.name) {
          names[String(f.student_id)] = f.student.user.name;
        }
      });
      setStudentNames(names);
      
      // Seed initial fees if db is completely empty
      if (mapped.length === 0) {
        // Find existing students to link fees
        const students = await studentApi.getStudents();
        if (students.length > 0) {
          for (let i = 0; i < Math.min(students.length, 3); i++) {
            await feeApi.createFee({
              student_id: students[i].id,
              amount: 5000,
              due_date: '2025-11-01',
              status: i === 0 ? 'paid' : i === 1 ? 'partial' : 'unpaid'
            });
          }
          // Fetch again
          const updatedFees = await feeApi.getFees();
          const remap = updatedFees.map((f: any) => ({
            id: String(f.id),
            studentId: String(f.student_id),
            class: f.student?.class?.name || '10',
            section: f.student?.section?.name || 'A',
            feeType: 'Tuition',
            totalAmount: Number(f.amount),
            paidAmount: f.status === 'paid' ? Number(f.amount) : f.status === 'partial' ? Number(f.amount) / 2 : 0,
            dueDate: f.due_date,
            paidDate: f.status === 'paid' ? f.updated_at?.split('T')[0] : null,
            status: f.status === 'unpaid' ? 'pending' : f.status,
            monthlyBreakdown: []
          }));
          updatedFees.forEach((f: any) => {
            if (f.student?.user?.name) {
              names[String(f.student_id)] = f.student.user.name;
            }
          });
          setStudentNames(names);
          setFees(remap);
          return;
        }
      }
      setFees(mapped);
    } catch (err) {
      console.error('Error fetching fees:', err);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const getStudentName = (studentId: string) => {
    return studentNames[studentId] || "Unknown"
  }

  const filteredFees = useMemo(() => {
    return fees.filter((fee) => {
      const studentName = getStudentName(fee.studentId)
      const matchesSearch =
        studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.feeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.status.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesClass = !selectedClass || fee.class === selectedClass
      const matchesSection = !selectedSection || fee.section === selectedSection

      return matchesSearch && matchesClass && matchesSection
    })
  }, [fees, searchTerm, selectedClass, selectedSection, studentNames])

  const paginatedFees = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage
    return filteredFees.slice(startIdx, startIdx + itemsPerPage)
  }, [filteredFees, currentPage])

  const totalPages = Math.ceil(filteredFees.length / itemsPerPage)
  const classes = Array.from(new Set(fees.map((f) => f.class))).sort()
  const sections = Array.from(new Set(fees.map((f) => f.section))).sort()

  const handlePayment = (fee: Fee) => {
    setCurrentFee(fee)
    setShowPaymentModal(true)
  }

  const handleSubmitPayment = async (amount: number) => {
    if (!currentFee) return

    try {
      const newPaidAmount = currentFee.paidAmount + amount
      const newStatus = newPaidAmount >= currentFee.totalAmount ? "paid" : newPaidAmount > 0 ? "partial" : "unpaid"

      await feeApi.updateFeeStatus(currentFee.id, newStatus);
      setShowPaymentModal(false)
      setCurrentFee(null)
      fetchFees()
    } catch (err) {
      console.error(err);
      alert('Failed to register fee payment');
    }
  }

  const handleSendReminders = () => {
    const pendingFees = fees.filter((f) => f.status === "pending" || f.status === "overdue" || f.status === "partial")
    console.log(`Sending reminders to ${pendingFees.length} students with pending payments`)
    alert(`Reminders sent to ${pendingFees.length} students`)
    setShowReminderModal(false)
  }

  const totalFees = fees.reduce((sum, fee) => sum + fee.totalAmount, 0)
  const collectedFees = fees.reduce((sum, fee) => sum + fee.paidAmount, 0)
  const pendingFees = totalFees - collectedFees

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600 mt-1">Track and manage student fee payments</p>
        </div>
        <button
          onClick={() => setShowReminderModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Send Reminders
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Total Fees</p>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalFees.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Collected</p>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">${collectedFees.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Pending</p>
            <DollarSign className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">${pendingFees.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Student name, fee type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Sections</option>
              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedClass("")
                setSelectedSection("")
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Paid Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{getStudentName(fee.studentId)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{fee.class}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{fee.section}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${fee.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">${fee.paidAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{fee.dueDate}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
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
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {fee.status !== "paid" && (
                        <button
                          onClick={() => handlePayment(fee)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                        >
                          Pay Now
                        </button>
                      )}
                      <button
                        onClick={() => onSelectFee(fee.id)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredFees.length)} of {filteredFees.length} records
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-lg transition ${
                  page === currentPage ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && currentFee && (
        <PaymentModal
          fee={currentFee}
          onClose={() => {
            setShowPaymentModal(false)
            setCurrentFee(null)
          }}
          onSubmit={handleSubmitPayment}
          studentName={getStudentName(currentFee.studentId)}
        />
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Send Payment Reminders</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to send payment reminders to all students with pending payments?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReminderModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReminders}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Send Reminders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeeList
