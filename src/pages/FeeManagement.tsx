"use client"

import { useState } from "react"
import FeeList from "./feeManagementComponents/fee-list"
import FeeDetailPage from "./feeManagementComponents/fee-detail-page"

export default function FeesPage() {
  const [selectedFeeId, setSelectedFeeId] = useState<string | null>(null)

  if (selectedFeeId) {
    return <FeeDetailPage feeId={selectedFeeId} onBack={() => setSelectedFeeId(null)} />
  }

  return <FeeList onSelectFee={setSelectedFeeId} />
}
