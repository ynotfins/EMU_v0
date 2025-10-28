"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { mockProfiles } from "@/lib/mock/profiles"
import { Logo } from "@/components/logo"

export default function AdminPage() {
  const users = Object.values(mockProfiles)

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo width={200} height={60} />
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">5</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verified Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{users.filter((u) => u.payout.verified).length}</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.displayName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.role === "admin"
                            ? "bg-[#FF3B30]"
                            : user.role === "supe"
                              ? "bg-[#007AFF]"
                              : "bg-[#34C759]"
                        }
                      >
                        {user.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.agency || "-"}</TableCell>
                    <TableCell>
                      <Switch
                        checked={user.payout.verified}
                        onCheckedChange={() => console.log("[v0] Toggle verify")}
                      />
                    </TableCell>
                    <TableCell>
                      <button className="text-[#007AFF] hover:underline text-sm">Edit</button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
