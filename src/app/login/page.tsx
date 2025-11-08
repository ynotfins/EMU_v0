"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
} from "firebase/auth"
import { auth } from "@/lib/firebase/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginSchema, type LoginInput } from "@/schemas/auth.schema"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmailLogin, setShowEmailLogin] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const user = auth.currentUser

      if (user) {
        setRedirecting(true)

        try {
          const { doc: docRef, getDoc } = await import("firebase/firestore")
          const { db } = await import("@/lib/firebase/firebase")

          const userDocRef = docRef(db, "users", user.uid)
          const userDoc = await getDoc(userDocRef)

          const userRole = userDoc.exists() ? userDoc.data().role || "supe" : "supe"

          const targetPath = (userRole === "super_admin" || userRole === "admin" || userRole === "supe")
            ? "/supe/incidents"
            : "/chaser/incidents"

          window.location.href = targetPath
        } catch (err) {
          console.error("[Login] Error during redirect:", err)
          setRedirecting(false)
        }
      }
    }

    const timer = setTimeout(checkAuthAndRedirect, 50)
    return () => clearTimeout(timer)
  }, [])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      const provider = new GoogleAuthProvider()
      const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768

      let result
      try {
        result = await signInWithPopup(auth, provider)
      } catch (popupError) {
        const error = popupError as { code?: string }
        if (error.code === "auth/popup-blocked" && isDesktop) {
          setError("Popup blocked. Please allow popups or use email/password sign-in.")
          setLoading(false)
          return
        }
        throw popupError
      }

      const user = result.user

      const { doc: docRef, getDoc, setDoc, updateDoc } = await import("firebase/firestore")
      const { db } = await import("@/lib/firebase/firebase")

      const userDocRef = docRef(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      const isSuperAdmin = user.email === "ynotfins@gmail.com"
      let userRole = "chaser"

      if (!userDoc.exists()) {
        const defaultRole = isSuperAdmin ? "super_admin" : "chaser"
        await setDoc(userDocRef, {
          id: user.uid,
          uid: user.uid,
          email: user.email,
          displayName: isSuperAdmin ? "Tony" : (user.displayName || user.email?.split("@")[0] || "User"),
          name: isSuperAdmin ? "Tony" : (user.displayName || user.email?.split("@")[0] || "User"),
          nickname: isSuperAdmin ? "Tony" : (user.displayName || user.email?.split("@")[0] || "User"),
          phone: user.phoneNumber || "",
          role: defaultRole,
          settings: {
            pushEnabled: true,
            trackingEnabled: true,
            muted: false,
            highAlertSound: "train",
          },
          payout: {
            verified: false,
            cashappHandle: "",
            venmoHandle: "",
          },
          stats: {
            responded: 0,
            noted: 0,
            daysActive: 1,
          },
          createdAt: new Date().toISOString(),
        })
        userRole = defaultRole
      } else {
        const userData = userDoc.data()
        userRole = userData.role || "chaser"

        if (isSuperAdmin && userData.displayName !== "Tony") {
          await updateDoc(userDocRef, {
            displayName: "Tony",
            name: "Tony",
            nickname: "Tony",
          })
        }
      }

      const targetPath = (userRole === "super_admin" || userRole === "admin" || userRole === "supe")
        ? "/supe/incidents"
        : "/chaser/incidents"

      window.location.href = targetPath
    } catch (err) {
      const error = err as { code?: string }
      if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled. Please try again.")
      } else if (error.code === "auth/popup-blocked") {
        setError("Popup blocked. Please allow popups for this site or use email/password sign-in.")
      } else {
        setError("Failed to sign in with Google. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (values: LoginInput) => {
    setLoading(true)
    setError(null)

    try {
      const result = await signInWithEmailAndPassword(auth, values.email, values.password)

      const { doc: docRef, getDoc, setDoc } = await import("firebase/firestore")
      const { db } = await import("@/lib/firebase/firebase")

      const userDocRef = docRef(db, "users", result.user.uid)
      const userDoc = await getDoc(userDocRef)

      let userRole = "chaser"
      if (userDoc.exists()) {
        userRole = userDoc.data().role || "chaser"
      } else {
        if (result.user.email === "ynotfins@gmail.com") {
          await setDoc(userDocRef, {
            id: result.user.uid,
            uid: result.user.uid,
            email: result.user.email,
            displayName: "Tony",
            name: "Tony",
            nickname: "Tony",
            phone: result.user.phoneNumber || "",
            role: "super_admin",
            settings: {
              pushEnabled: true,
              trackingEnabled: true,
              muted: false,
              highAlertSound: "train",
            },
            payout: {
              verified: false,
              cashappHandle: "",
              venmoHandle: "",
            },
            stats: {
              responded: 0,
              noted: 0,
              daysActive: 1,
            },
            createdAt: new Date().toISOString(),
          })
          userRole = "super_admin"
        }
      }

      const targetPath = (userRole === "super_admin" || userRole === "admin" || userRole === "supe")
        ? "/supe/incidents"
        : "/chaser/incidents"

      window.location.href = targetPath
    } catch (err) {
      const error = err as { code?: string }
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email.")
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password.")
      } else if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password.")
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address.")
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.")
      } else {
        setError("Failed to sign in. Please check your credentials.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="white"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            EMU Alerts
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Sign in to access emergency alerts and incident management
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!showEmailLogin ? (
            <>
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-12 bg-background hover:bg-muted text-foreground border-2 border-border font-semibold text-base shadow-md hover:shadow-lg transition-all"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </div>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                onClick={() => setShowEmailLogin(true)}
                variant="outline"
                className="w-full h-12 text-foreground border-2 border-border font-semibold text-base hover:bg-muted"
              >
                Sign in with Email
              </Button>
            </>
          ) : (
            <>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleEmailSignIn)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Email"
                            disabled={loading}
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Password"
                            disabled={loading}
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>

              <Button
                onClick={() => {
                  setShowEmailLogin(false)
                  setError(null)
                  form.reset()
                }}
                variant="ghost"
                className="w-full text-sm text-muted-foreground"
                disabled={loading}
              >
                ← Back to sign-in options
              </Button>
            </>
          )}

          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p className="text-xs">
              By signing in, you agree to our terms of service
            </p>
            <p className="text-sm">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="font-semibold text-primary hover:underline"
              >
                Create Account
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
