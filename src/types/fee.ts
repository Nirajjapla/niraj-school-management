export interface Student {
    id: string
    firstName: string
    lastName: string
    class: string
    section: string
    rollNumber?: string
  }
  
  export interface MonthlyFee {
    month: string
    amount: number
    paidAmount: number
    status: "paid" | "pending" | "overdue"
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
  
  export interface PaymentRecord {
    id: string
    feeId: string
    amount: number
    paymentDate: string
    method: string
    transactionId: string
  }
  
  export interface Receipt {
    id: string
    paymentId: string
    studentName: string
    studentId: string
    amount: number
    date: string
    feeType: string
  }
  