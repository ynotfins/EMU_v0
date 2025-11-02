"use client"

import { RoleLayout } from "@/components/role-layout"
import { LiveMap } from "@/components/live-map"
import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"

export default function SupeMapPage() {
  const [points, setPoints] = useState<any[]>([])

  useEffect(() => {
    const loadPoints = async () => {
      const since = Timestamp.fromDate(new Date(Date.now() - 4 * 60 * 60 * 1000))
      const q = query(
        collection(db, "incidents"),
        where("updatedAt", ">", since),
        orderBy("updatedAt", "desc")
      )
      try {
        const snapshot = await getDocs(q)
        const rows = snapshot.docs
          .map(d => ({ id: d.id, ...(d.data() as any) }))
          .filter(r => typeof r.lat === "number" && typeof r.lng === "number" && r.lat > -90 && r.lat < 90 && r.lng > -180 && r.lng < 180)
        setPoints(rows)
      } catch (err) {
        console.error("[SupeMap] Error loading incidents:", err)
      }
    }
    loadPoints()
  }, [])

  const handleRefresh = () => {
    const since = Timestamp.fromDate(new Date(Date.now() - 4 * 60 * 60 * 1000))
    const q = query(
      collection(db, "incidents"),
      where("updatedAt", ">", since),
      orderBy("updatedAt", "desc")
    )
    getDocs(q).then(snapshot => {
      const rows = snapshot.docs
        .map(d => ({ id: d.id, ...(d.data() as any) }))
        .filter(r => typeof r.lat === "number" && typeof r.lng === "number" && r.lat > -90 && r.lat < 90 && r.lng > -180 && r.lng < 180)
      setPoints(rows)
    }).catch(console.error)
  }

  return (
    <RoleLayout role="supe">
      <div className="p-4">
        <LiveMap markers={points.map(p => ({ id: p.id, lat: p.lat, lng: p.lng, title: p.address || "" }))} />
      </div>
    </RoleLayout>
  )
}
