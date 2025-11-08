"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ArrowRight, Mail, Phone, User, Camera, CheckCircle2 } from "lucide-react"
import { signupNewSchema, type SignupNewInput } from "@/schemas/signup-new.schema"

type Step = "info" | "verify" | "id" | "processing" | "complete"

export default function NewSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("info")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [password, setPassword] = useState("")
  const [idImage, setIdImage] = useState<string | null>(null)
  const [formData, setFormData] = useState<SignupNewInput | null>(null)

  const form = useForm<SignupNewInput>({
    resolver: zodResolver(signupNewSchema),
    defaultValues: {
      nickname: "",
      email: "",
      phone: "",
    },
  })

  const formatPhone = (value: string) => {
    const input = value.replace(/\D/g, "").slice(0, 10)
    if (input.length > 6) {
      return `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6)}`
    } else if (input.length > 3) {
      return `(${input.slice(0, 3)}) ${input.slice(3)}`
    } else if (input.length > 0) {
      return `(${input}`
    }
    return input
  }

  const handleStep1Submit = async (values: SignupNewInput) => {
    setError("")
    setLoading(true)
    setFormData(values)

    try {
      const tempPassword = Math.random().toString(36).slice(-8) + "!Aa1"
      setPassword(tempPassword)

      const userCredential = await createUserWithEmailAndPassword(auth, values.email, tempPassword)
      await sendEmailVerification(userCredential.user)

      setStep("verify")
    } catch (err) {
      const error = err as { code?: string }
      if (error.code === "auth/email-already-in-use") {
        setError("Email already in use")
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address")
      } else {
        setError("Failed to create account. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Wait for email verification
  const checkVerification = async () => {
    setLoading(true);
    try {
      await auth.currentUser?.reload();
      
      if (auth.currentUser?.emailVerified) {
        console.log("[Signup] [OK] Email verified");
        setStep("id");
      } else {
        setError("Email not verified yet. Please check your inbox.");
      }
    } catch (err) {
      console.error("[Signup] [X] Verification check error:", err);
      setError("Error checking verification status");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Capture ID with camera
  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      // Convert to base64 for preview and OCR
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setIdImage(base64);
        
        // Move to processing step
        setStep("processing");
        
        // Simulate OCR processing (will integrate real OCR later)
        await processIDWithOCR(base64);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("[Signup] [X] ID capture error:", err);
      setError("Failed to capture ID. Please try again.");
      setLoading(false);
    }
  };

  // Step 4: Process ID with OCR
  const processIDWithOCR = async (imageData: string) => {
    try {
      console.log("[Signup] [SEARCH] Processing ID with OCR...");
      
      // Simulate OCR processing (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock extracted data (will be replaced with real OCR)
      const extractedData = {
        firstName: "John",
        lastName: "Doe",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
        dob: "01/01/1990",
        idNumber: "D1234567",
      };

      console.log("[Signup] [OK] OCR complete, extracted data:", extractedData);

      if (!auth.currentUser || !formData) return

      await setDoc(doc(db, "users", auth.currentUser.uid), {
        id: auth.currentUser.uid,
        email: formData.email,
        nickname: formData.nickname,
        name: `${extractedData.firstName} ${extractedData.lastName}`,
        firstName: extractedData.firstName,
        lastName: extractedData.lastName,
        phone: formData.phone.replace(/\D/g, ""),
        role: "chaser",
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
        idVerification: {
          verified: true,
          idNumber: extractedData.idNumber,
          dob: extractedData.dob,
          uploadedAt: new Date().toISOString(),
        },
        address: {
          street: extractedData.address,
          city: extractedData.city,
          state: extractedData.state,
          zip: extractedData.zip,
        },
        createdAt: new Date().toISOString(),
      })

      await setDoc(doc(db, "independent_contractors", auth.currentUser.uid), {
        id: auth.currentUser.uid,
        nickname: formData.nickname,
        firstName: extractedData.firstName,
        lastName: extractedData.lastName,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ""),
        role: "chaser",
        status: "active",
        idVerified: true,
        idData: extractedData,
        hireDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })

      console.log("[Signup] [OK] User profile and contractor record created");
      setStep("complete");

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/chaser/incidents");
      }, 2000);

    } catch (err) {
      console.error("[Signup] [X] OCR processing error:", err);
      setError("Failed to process ID. Please try again.");
      setStep("id");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
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
          <CardTitle className="text-3xl font-bold text-gray-900">
            Join NFA Alerts
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            {step === "info" && "Let's get you started"}
            {step === "verify" && "Check your email"}
            {step === "id" && "Verify your identity"}
            {step === "processing" && "Processing your ID"}
            {step === "complete" && "Welcome to the team!"}
          </CardDescription>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <div className={`w-3 h-3 rounded-full transition-colors ${step === "info" ? "bg-blue-600" : "bg-gray-300"}`} />
            <div className={`w-3 h-3 rounded-full transition-colors ${step === "verify" ? "bg-blue-600" : "bg-gray-300"}`} />
            <div className={`w-3 h-3 rounded-full transition-colors ${step === "id" || step === "processing" || step === "complete" ? "bg-blue-600" : "bg-gray-300"}`} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {step === "info" && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleStep1Submit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nickname
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="What should we call you?"
                          className="h-14 text-base border-2 focus:border-blue-500 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="h-14 text-base border-2 focus:border-blue-500 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          inputMode="numeric"
                          placeholder="(555) 123-4567"
                          className="h-14 text-base border-2 focus:border-blue-500 rounded-xl"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatPhone(e.target.value)
                            field.onChange(formatted)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Continue</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          )}

          {/* STEP 2: Email Verification */}
          {step === "verify" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-10 w-10 text-blue-600" />
              </div>

              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900">
                  Verification Email Sent!
                </p>
                <p className="text-sm text-gray-600">
                  We sent a verification link to:
                  <br />
                  <strong className="text-gray-900">{formData?.email}</strong>
                </p>
              </div>

              <Button
                onClick={checkVerification}
                disabled={loading}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              >
                {loading ? "Checking..." : "I've Verified My Email"}
              </Button>

              <p className="text-xs text-gray-500">
                Didn't receive it? Check your spam folder.
              </p>
            </div>
          )}

          {/* STEP 3: ID Capture */}
          {step === "id" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Camera className="h-10 w-10 text-green-600" />
              </div>

              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900">
                  Take a Photo of Your ID
                </p>
                <p className="text-sm text-gray-600">
                  We'll automatically extract your information
                  <br />
                  <span className="text-xs">(Driver's License or State ID)</span>
                </p>
              </div>

              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  className="hidden"
                  disabled={loading}
                />
                <Button
                  type="button"
                  onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                  disabled={loading}
                  className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Open Camera
                </Button>
              </label>
            </div>
          )}

          {/* STEP 4: Processing */}
          {step === "processing" && (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>

              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900">
                  Processing Your ID...
                </p>
                <p className="text-sm text-gray-600">
                  Extracting your information
                </p>
              </div>

              {idImage && (
                <img
                  src={idImage}
                  alt="ID Preview"
                  className="w-full max-w-xs mx-auto rounded-xl shadow-lg"
                />
              )}
            </div>
          )}

          {/* STEP 5: Complete */}
          {step === "complete" && (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>

              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  Welcome, {formData?.nickname}! 🎉
                </p>
                <p className="text-sm text-gray-600">
                  Your account has been created successfully
                  <br />
                  <span className="text-xs">Redirecting to your dashboard...</span>
                </p>
              </div>
            </div>
          )}

          {/* Back to Login */}
          {step === "info" && (
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="font-semibold text-blue-600 hover:underline">
                Sign In
              </a>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

