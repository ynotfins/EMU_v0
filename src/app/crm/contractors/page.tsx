"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Filter, Download, Users, Phone, Mail, MapPin, CheckCircle2, Clock } from "lucide-react";
import { ProtectedRoute } from "@/components/features/protected-route";

interface Contractor {
  id: string;
  nickname: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "chaser" | "supe";
  status: "active" | "inactive" | "pending";
  idVerified: boolean;
  hireDate: string;
  createdAt: string;
  idData?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    dob?: string;
    idNumber?: string;
  };
}

export default function CRMContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "chaser" | "supe">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "pending">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.debug("Loading contractors", { code: 'CRMContractors' });

    const q = query(
      collection(db, "independent_contractors"),
      orderBy("createdAt", "desc"),
      limit(100) // Limit to prevent high-cost queries
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contractorsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Contractor[];

      logger.info(`Loaded ${contractorsList.length} contractors`, {
        code: 'CRMContractors',
        count: contractorsList.length,
      });
      setContractors(contractorsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter contractors
  const filteredContractors = contractors.filter((contractor) => {
    const matchesSearch =
      contractor.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || contractor.role === roleFilter;
    const matchesStatus = statusFilter === "all" || contractor.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats
  const stats = {
    total: contractors.length,
    active: contractors.filter((c) => c.status === "active").length,
    chasers: contractors.filter((c) => c.role === "chaser").length,
    supes: contractors.filter((c) => c.role === "supe").length,
    verified: contractors.filter((c) => c.idVerified).length,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Independent Contractors & Employees
            </h1>
            <p className="text-gray-600">
              Manage your team of field responders and supervisors
            </p>
          </div>

          <Button
            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add Contractor
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chasers</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.chasers}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚒</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Supes</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.supes}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ID Verified</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.verified}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, nickname, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 pl-12 text-base border-2 focus:border-blue-500 rounded-xl"
                />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as "all" | "chaser" | "supe")}
                className="h-12 px-4 border-2 border-gray-200 rounded-xl text-base font-medium focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="chaser">Chasers</option>
                <option value="supe">Supes</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive" | "pending")}
                className="h-12 px-4 border-2 border-gray-200 rounded-xl text-base font-medium focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>

              {/* Export Button */}
              <Button
                variant="outline"
                className="h-12 px-6 border-2 font-semibold rounded-xl"
              >
                <Download className="h-5 w-5 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contractors List */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading contractors...</p>
          </div>
        ) : filteredContractors.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-900 mb-2">
                No contractors found
              </p>
              <p className="text-gray-600">
                Try adjusting your filters or search term
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredContractors.map((contractor) => (
              <Card
                key={contractor.id}
                className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {contractor.nickname.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div>
                        <CardTitle className="text-xl mb-1">
                          {contractor.nickname}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {contractor.firstName} {contractor.lastName}
                        </CardDescription>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-col gap-2 items-end">
                      <Badge
                        className={
                          contractor.role === "supe"
                            ? "bg-blue-500"
                            : "bg-green-500"
                        }
                      >
                        {contractor.role.toUpperCase()}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          contractor.status === "active"
                            ? "border-green-500 text-green-700"
                            : contractor.status === "pending"
                            ? "border-yellow-500 text-yellow-700"
                            : "border-gray-500 text-gray-700"
                        }
                      >
                        {contractor.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Contact Info */}
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{contractor.email}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>
                      ({contractor.phone.slice(0, 3)}) {contractor.phone.slice(3, 6)}-
                      {contractor.phone.slice(6)}
                    </span>
                  </div>

                  {contractor.idData?.city && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {contractor.idData.city}, {contractor.idData.state}
                      </span>
                    </div>
                  )}

                  {/* ID Verification */}
                  <div className="flex items-center gap-3 pt-3 border-t">
                    {contractor.idVerified ? (
                      <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        ID Verified
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-yellow-600 font-semibold">
                        <Clock className="h-4 w-4" />
                        ID Pending
                      </div>
                    )}

                    <span className="text-xs text-gray-500">
                      Hired {new Date(contractor.hireDate).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>
    </ProtectedRoute>
  );
}

