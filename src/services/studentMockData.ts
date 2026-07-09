export interface Student {
    id: string
    firstName: string
    lastName: string
    class: string
    section: string
    email: string
  }
  
  export interface MonthlyFee {
    month: string
    amount: number
    paidAmount: number
    status: "paid" | "pending" | "overdue" | "partial"
    dueDate: string
    paidDate: string | null
  }
  
  export interface Fee {
    id: string
    studentId: string
    class: string
    section: string
    feeType: string
    totalAmount: number
    paidAmount: number
    dueDate: string
    paidDate: string | null
    status: "paid" | "pending" | "partial" | "overdue"
    monthlyBreakdown: MonthlyFee[]
  }
  
  export const mockStudents: Student[] = [
    { id: "1", firstName: "John", lastName: "Doe", class: "10", section: "A", email: "john@school.com" },
    { id: "2", firstName: "Jane", lastName: "Smith", class: "10", section: "A", email: "jane@school.com" },
    { id: "3", firstName: "Mike", lastName: "Johnson", class: "10", section: "B", email: "mike@school.com" },
    { id: "4", firstName: "Sarah", lastName: "Williams", class: "9", section: "A", email: "sarah@school.com" },
    { id: "5", firstName: "Tom", lastName: "Brown", class: "9", section: "B", email: "tom@school.com" },
    { id: "6", firstName: "Emily", lastName: "Davis", class: "11", section: "A", email: "emily@school.com" },
  ]
  
  export const mockFees: Fee[] = [
    {
      id: "f1",
      studentId: "1",
      class: "10",
      section: "A",
      feeType: "Tuition",
      totalAmount: 5000,
      paidAmount: 2500,
      dueDate: "2025-01-31",
      paidDate: "2024-12-15",
      status: "partial",
      monthlyBreakdown: [
        {
          month: "January 2025",
          amount: 5000,
          paidAmount: 5000,
          status: "paid",
          dueDate: "2025-01-31",
          paidDate: "2025-01-15",
        },
        {
          month: "February 2025",
          amount: 5000,
          paidAmount: 2500,
          status: "pending",
          dueDate: "2025-02-28",
          paidDate: null,
        },
      ],
    },
    {
      id: "f2",
      studentId: "2",
      class: "10",
      section: "A",
      feeType: "Tuition",
      totalAmount: 5000,
      paidAmount: 5000,
      dueDate: "2025-01-31",
      paidDate: "2024-12-20",
      status: "paid",
      monthlyBreakdown: [
        {
          month: "January 2025",
          amount: 5000,
          paidAmount: 5000,
          status: "paid",
          dueDate: "2025-01-31",
          paidDate: "2024-12-20",
        },
      ],
    },
    {
      id: "f3",
      studentId: "3",
      class: "10",
      section: "B",
      feeType: "Tuition",
      totalAmount: 5000,
      paidAmount: 0,
      dueDate: "2025-01-31",
      paidDate: null,
      status: "pending",
      monthlyBreakdown: [
        { month: "January 2025", amount: 5000, paidAmount: 0, status: "pending", dueDate: "2025-01-31", paidDate: null },
      ],
    },
    {
      id: "f4",
      studentId: "4",
      class: "9",
      section: "A",
      feeType: "Tuition",
      totalAmount: 5000,
      paidAmount: 0,
      dueDate: "2024-12-31",
      paidDate: null,
      status: "overdue",
      monthlyBreakdown: [
        { month: "January 2025", amount: 5000, paidAmount: 0, status: "overdue", dueDate: "2024-12-31", paidDate: null },
      ],
    },
    {
      id: "f5",
      studentId: "5",
      class: "9",
      section: "B",
      feeType: "Tuition",
      totalAmount: 5000,
      paidAmount: 3000,
      dueDate: "2025-01-31",
      paidDate: "2025-01-10",
      status: "partial",
      monthlyBreakdown: [
        {
          month: "January 2025",
          amount: 5000,
          paidAmount: 3000,
          status: "partial",
          dueDate: "2025-01-31",
          paidDate: "2025-01-10",
        },
      ],
    },
    {
      id: "f6",
      studentId: "6",
      class: "11",
      section: "A",
      feeType: "Tuition",
      totalAmount: 5000,
      paidAmount: 5000,
      dueDate: "2025-01-31",
      paidDate: "2024-12-10",
      status: "paid",
      monthlyBreakdown: [
        {
          month: "January 2025",
          amount: 5000,
          paidAmount: 5000,
          status: "paid",
          dueDate: "2025-01-31",
          paidDate: "2024-12-10",
        },
      ],
    },
  ]
  