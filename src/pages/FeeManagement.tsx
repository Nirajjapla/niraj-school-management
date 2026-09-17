"use client"

import { useState } from "react"
import FeeList from "./feeManagementComponents/fee-list"
import FeeDetailPage from "./feeManagementComponents/fee-detail-page"
import FeeStructureManagement from "./FeeStructureManagement"

export default function FeesPage() {
  const [selectedFeeId, setSelectedFeeId] = useState<string | null>(null)
  const [showStructureManagement, setShowStructureManagement] = useState(false)

  if (showStructureManagement) {
    return <FeeStructureManagement />
  }

  if (selectedFeeId) {
    return <FeeDetailPage feeId={selectedFeeId} onBack={() => setSelectedFeeId(null)} />
  }

  return <FeeList onSelectFee={setSelectedFeeId} onShowStructureManagement={() => setShowStructureManagement(true)} />
}
