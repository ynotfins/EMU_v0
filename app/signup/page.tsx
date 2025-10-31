"use client"

import type React from "react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  // Role is now always "chaser" - Supes created by admin only
  const role = "chaser"
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate first name
    if (!firstName.trim()) {
      setError("First name is required")
      return
    }

    // Validate last name
    if (!lastName.trim()) {
      setError("Last name is required")
      return
    }

    // Validate phone number (must be exactly 10 digits)
    const phoneDigits = phone.replace(/\D/g, "")
    if (phoneDigits.length !== 10) {
      setError("Phone number must be exactly 10 digits")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      console.log("[Signup] Creating account:", email, "as", role)

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create Firestore user profile with all required fields
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        email: user.email,
        name: `${firstName} ${lastName}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phoneDigits, // Store as 10 digits
        role: role, // Always "chaser" - Supes created by admin
        settings: {
          muted: false,
          highAlertSound: "train",
        },
        createdAt: new Date().toISOString(),
      })

      console.log("[Signup] ✅ Chaser account created successfully")

      // All signups go to chaser route
      router.push("/chaser/incidents")
    } catch (err: any) {
      console.error("[Signup] ❌ Error:", err)

      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use. Please sign in instead.")
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.")
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.")
      } else {
        setError("Failed to create account. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo width={280} height={84} />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Sign up to get full access to EMU Alerts as a chaser</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Role selection removed - all signups are chasers */}
            {/* Supes and admins are created by super_admin in the admin panel */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>🚒 Creating Chaser Account</strong>
                <br />
                <span className="text-xs">
                  Supervisors and admins are created by management. If you need elevated access, contact your administrator.
                </span>
              </p>
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => {
                  // Format phone as user types
                  const input = e.target.value.replace(/\D/g, "").slice(0, 10);
                  let formatted = input;
                  if (input.length > 6) {
                    formatted = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6)}`;
                  } else if (input.length > 3) {
                    formatted = `(${input.slice(0, 3)}) ${input.slice(3)}`;
                  } else if (input.length > 0) {
                    formatted = `(${input}`;
                  }
                  setPhone(formatted);
                }}
                required
              />
              <p className="text-xs text-gray-500">10 digits required</p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#007AFF] hover:bg-[#0051D5]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
            <div className="text-center text-sm">
              <span className="text-[#6B7280]">Already have an account? </span>
              <Link href="/login" className="text-[#007AFF] hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
