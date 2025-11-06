"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { logger } from "@/lib/utils/logger";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Redirect if already logged in - ONE-TIME CHECK ONLY
  useEffect(() => {
    // Use a one-time check instead of listener to avoid race conditions
    const checkAuthAndRedirect = async () => {
      const user = auth.currentUser;
      
      if (user) {
        logger.debug('User already authenticated', {
          code: 'LoginPage',
          email: user.email || undefined,
        });
        setRedirecting(true);
        
        try {
          // Check user role and redirect accordingly
          const { doc: docRef, getDoc } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase-client");
          
          const userDocRef = docRef(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let userRole = "supe"; // Default to supe
          if (userDoc.exists()) {
            userRole = userDoc.data().role || "supe";
          }

          logger.debug('Redirecting user', {
            code: 'LoginPage',
            role: userRole,
          });

          // Immediate redirect - no delay
          const targetPath = (userRole === "super_admin" || userRole === "admin" || userRole === "supe") 
            ? "/supe/incidents" 
            : "/chaser/incidents";
          
          logger.debug('Navigating to role home', {
            code: 'LoginPage',
            targetPath,
          });
          window.location.href = targetPath; // Force hard navigation to break any loops
        } catch (err) {
          logger.error('Error during redirect', err, {
            code: 'LoginPage',
          });
          setRedirecting(false);
        }
      }
    };

    // Wait a tiny bit for auth to initialize, then check once
    const timer = setTimeout(checkAuthAndRedirect, 50);
    
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      
      // Check if we're on desktop and popup might be blocked
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
      
      // Try popup first, fallback to redirect on desktop if popup fails
      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError: any) {
        if (popupError.code === "auth/popup-blocked" && isDesktop) {
          // On desktop, try redirect flow as fallback
          setError("Popup blocked. Please allow popups or use email/password sign-in.");
          setLoading(false);
          return;
        }
        throw popupError;
      }
      
      const user = result.user;
      logger.debug('Google sign-in successful', {
        code: 'LoginPage',
        email: user.email || undefined,
      });

      // Check if user profile exists in Firestore
      const { doc: docRef, getDoc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase-client");
      
      const userDocRef = docRef(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      let userRole = "chaser"; // Default to chaser for new users

      if (!userDoc.exists()) {
        logger.debug('New Google user - creating profile', {
          code: 'LoginPage',
        });
        
        // Special handling for ynotfins@gmail.com - default to super_admin
        const isSuperAdmin = user.email === "ynotfins@gmail.com";
        const defaultRole = isSuperAdmin ? "super_admin" : "chaser";
        
        // Create Firestore profile for new Google user
        const { setDoc } = await import("firebase/firestore");
        await setDoc(userDocRef, {
          id: user.uid,
          uid: user.uid,
          email: user.email,
          displayName: isSuperAdmin ? "Tony" : (user.displayName || user.email?.split("@")[0] || "User"),
          name: isSuperAdmin ? "Tony" : (user.displayName || user.email?.split("@")[0] || "User"),
          nickname: isSuperAdmin ? "Tony" : (user.displayName || user.email?.split("@")[0] || "User"),
          phone: user.phoneNumber || "",
          role: defaultRole, // super_admin for ynotfins@gmail.com, chaser for others
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
        });

        logger.debug('Firestore profile created for Google user', {
          code: 'LoginPage',
        });
        userRole = defaultRole;
      } else {
        // Get existing role, but update name if ynotfins@gmail.com
        const userData = userDoc.data();
        userRole = userData.role || "chaser";
        
        // Update name to Tony if it's ynotfins@gmail.com
        if (user.email === "ynotfins@gmail.com" && userData.displayName !== "Tony") {
          const { updateDoc } = await import("firebase/firestore");
          await updateDoc(userDocRef, {
            displayName: "Tony",
            name: "Tony",
            nickname: "Tony",
          });
        }
      }

      // Redirect based on role - super_admin defaults to supe view
      logger.debug('Google sign-in complete, redirecting', {
        code: 'LoginPage',
        role: userRole,
      });
      const targetPath = (userRole === "super_admin" || userRole === "admin" || userRole === "supe") 
        ? "/supe/incidents" 
        : "/chaser/incidents";
      
      // Use hard navigation to break any potential loops
      window.location.href = targetPath;
    } catch (err: any) {
      logger.error('Google sign-in error', err, {
        code: 'LoginPage',
      });

      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled. Please try again.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup blocked. Please allow popups for this site or use email/password sign-in.");
      } else {
        setError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("[Login] [OK] Email sign-in successful:", result.user.email);
      
      // Check user role and redirect accordingly
      const { doc: docRef, getDoc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase-client");
      
      const userDocRef = docRef(db, "users", result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userRole = "chaser"; // Default to chaser
      if (userDoc.exists()) {
        userRole = userDoc.data().role || "chaser";
      } else {
        // Check if this is ynotfins@gmail.com - create profile with super_admin role
        if (result.user.email === "ynotfins@gmail.com") {
          const { setDoc } = await import("firebase/firestore");
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
          });
          userRole = "super_admin";
        }
      }

      // Redirect based on role - super_admin defaults to supe view
      logger.debug('Email sign-in complete, redirecting', {
        code: 'LoginPage',
        role: userRole,
      });
      const targetPath = (userRole === "super_admin" || userRole === "admin" || userRole === "supe") 
        ? "/supe/incidents" 
        : "/chaser/incidents";
      
      // Use hard navigation to break any potential loops
      window.location.href = targetPath;
    } catch (err: any) {
      logger.error('Email sign-in error', err, {
        code: 'LoginPage',
      });

      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("Failed to sign in. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while redirecting
  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
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
            EMU Alerts
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Sign in to access emergency alerts and incident management
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!showEmailLogin ? (
            <>
              {/* Google Sign-In Button */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 font-semibold text-base shadow-md hover:shadow-lg transition-all"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
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

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              {/* Email/Password Button */}
              <Button
                onClick={() => setShowEmailLogin(true)}
                variant="outline"
                className="w-full h-12 text-gray-900 border-2 border-gray-300 font-semibold text-base hover:bg-gray-50"
              >
                Sign in with Email
              </Button>
            </>
          ) : (
            <>
              {/* Email/Password Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="h-12 text-base"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="h-12 text-base"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              {/* Back to options */}
              <Button
                onClick={() => {
                  setShowEmailLogin(false);
                  setError(null);
                  setEmail("");
                  setPassword("");
                }}
                variant="ghost"
                className="w-full text-sm text-gray-600"
                disabled={loading}
              >
                ← Back to sign-in options
              </Button>
            </>
          )}

          <div className="text-center text-sm text-gray-500 space-y-2">
            <p className="text-xs">
              By signing in, you agree to our terms of service
            </p>
            <p className="text-sm">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Create Account
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
