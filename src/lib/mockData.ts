import type { Fee, MonthlyFee } from "../types/fee"

export const mockStudents = [
  {
    id: "1",
    studentId: "STU001",
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "2010-05-15",
    gender: "Male",
    class: "10",
    section: "A",
    rollNumber: "101",
    admissionDate: "2020-04-01",
    parentName: "Robert Doe",
    parentPhone: "+1234567890",
    parentEmail: "robert@example.com",
    address: "123 Main St, City",
    status: "active",
  },
  {
    id: "2",
    studentId: "STU002",
    firstName: "Jane",
    lastName: "Smith",
    dateOfBirth: "2011-08-22",
    gender: "Female",
    class: "9",
    section: "B",
    rollNumber: "102",
    admissionDate: "2021-04-01",
    parentName: "Michael Smith",
    parentPhone: "+1234567891",
    parentEmail: "michael@example.com",
    address: "456 Oak Ave, City",
    status: "active",
  },
  {
    id: "3",
    studentId: "STU003",
    firstName: "Alex",
    lastName: "Johnson",
    dateOfBirth: "2010-11-10",
    gender: "Male",
    class: "10",
    section: "A",
    rollNumber: "103",
    admissionDate: "2020-04-01",
    parentName: "David Johnson",
    parentPhone: "+1234567892",
    parentEmail: "david@example.com",
    address: "789 Pine Rd, City",
    status: "active",
  },
  {
    id: "4",
    studentId: "STU004",
    firstName: "Sara",
    lastName: "Williams",
    dateOfBirth: "2009-03-08",
    gender: "Female",
    class: "11",
    section: "A",
    rollNumber: "104",
    admissionDate: "2019-04-01",
    parentName: "James Williams",
    parentPhone: "+1234567893",
    parentEmail: "james@example.com",
    address: "321 Elm St, City",
    status: "active",
  },
  {
    id: "5",
    studentId: "STU005",
    firstName: "Mike",
    lastName: "Brown",
    dateOfBirth: "2011-06-12",
    gender: "Male",
    class: "9",
    section: "A",
    rollNumber: "105",
    admissionDate: "2021-04-01",
    parentName: "Thomas Brown",
    parentPhone: "+1234567894",
    parentEmail: "thomas@example.com",
    address: "654 Oak St, City",
    status: "active",
  },
]

// Helper function to create monthly breakdown for a fee period
function createMonthlyBreakdown(
  startMonth: number,
  startYear: number,
  duration: number,
  monthlyAmount: number,
): MonthlyFee[] {
  const breakdown: MonthlyFee[] = []
  const currentDate = new Date()

  for (let i = 0; i < duration; i++) {
    const date = new Date(startYear, startMonth + i, 1)
    const monthName = date.toLocaleString("default", { month: "long", year: "numeric" })

    // Determine payment status based on current date
    let status: "paid" | "pending" | "overdue" = "pending"
    let paidAmount = 0
    let paidDate: string | null = null

    const dueDate = new Date(startYear, startMonth + i, 30)

    if (date < currentDate) {
      if (i < 2) {
        status = "paid"
        paidAmount = monthlyAmount
        paidDate = new Date(date.getFullYear(), date.getMonth(), 15).toISOString().split("T")[0]
      } else {
        status = "overdue"
      }
    }

    breakdown.push({
      month: monthName,
      amount: monthlyAmount,
      paidAmount,
      status,
      dueDate: dueDate.toISOString().split("T")[0],
      paidDate,
    })
  }

  return breakdown
}

export const mockFees: Fee[] = [
  {
    id: "1",
    studentId: "1",
    class: "10",
    section: "A",
    feeType: "tuition",
    totalAmount: 50000,
    paidAmount: 10000,
    dueDate: "2025-11-30",
    paidDate: "2025-10-05",
    status: "partial",
    monthlyBreakdown: createMonthlyBreakdown(9, 2025, 12, 5000),
  },
  {
    id: "2",
    studentId: "2",
    class: "9",
    section: "B",
    feeType: "tuition",
    totalAmount: 50000,
    paidAmount: 2500,
    dueDate: "2025-11-30",
    paidDate: "2025-10-05",
    status: "partial",
    monthlyBreakdown: createMonthlyBreakdown(9, 2025, 12, 5000),
  },
  {
    id: "3",
    studentId: "3",
    class: "10",
    section: "A",
    feeType: "tuition",
    totalAmount: 50000,
    paidAmount: 0,
    dueDate: "2025-11-30",
    paidDate: null,
    status: "pending",
    monthlyBreakdown: createMonthlyBreakdown(9, 2025, 12, 5000),
  },
  {
    id: "4",
    studentId: "4",
    class: "11",
    section: "A",
    feeType: "tuition",
    totalAmount: 50000,
    paidAmount: 50000,
    dueDate: "2025-10-31",
    paidDate: "2025-10-01",
    status: "paid",
    monthlyBreakdown: createMonthlyBreakdown(9, 2025, 12, 5000),
  },
  {
    id: "5",
    studentId: "5",
    class: "9",
    section: "A",
    feeType: "tuition",
    totalAmount: 50000,
    paidAmount: 15000,
    dueDate: "2025-11-30",
    paidDate: "2025-10-10",
    status: "partial",
    monthlyBreakdown: createMonthlyBreakdown(9, 2025, 12, 5000),
  },
]

export function getStudentById(id: string) {
  return mockStudents.find((s) => s.id === id)
}

export function getFeesByClass(className: string) {
  return mockFees.filter((f) => f.class === className)
}

export function getFeesByClassAndSection(className: string, section: string) {
  return mockFees.filter((f) => f.class === className && f.section === section)
}

export function getUniquClasses() {
  return [...new Set(mockFees.map((f) => f.class))].sort()
}

export function getUniqueSections(className?: string) {
  if (className) {
    return [...new Set(mockFees.filter((f) => f.class === className).map((f) => f.section))].sort()
  }
  return [...new Set(mockFees.map((f) => f.section))].sort()
}
