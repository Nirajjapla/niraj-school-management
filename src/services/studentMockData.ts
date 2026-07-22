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
  
  export const mockStudents: Student[] = []
  
  export const mockFees: Fee[] = []

  