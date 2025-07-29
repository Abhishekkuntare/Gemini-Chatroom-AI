"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { setCountries, setSelectedCountry, setOtpSent, loginSuccess, setLoading } from "@/store/slices/authSlice"
import { Loader2, Phone, Shield, MessageSquare, AlertTriangle, CheckCircle, CreditCard, Settings } from "lucide-react"
import { sendOTP, verifyOTP } from "@/lib/otp-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long")
    .regex(/^\d+$/, "Phone number must contain only digits"),
})

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only digits"),
})

export default function AuthPage() {
  const [step, setStep] = useState("phone")
  const [otpTimer, setOtpTimer] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const [fullPhoneNumber, setFullPhoneNumber] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isTrialLimitation, setIsTrialLimitation] = useState(false)
  const [developmentMode, setDevelopmentMode] = useState(false)
  const [developmentOTP, setDevelopmentOTP] = useState("")

  const { countries, selectedCountry, otpSent, loading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const { toast } = useToast()

  const phoneForm = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
    },
  })

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  })

  useEffect(() => {
    fetchCountries()
  }, [])

  // OTP Timer countdown
  useEffect(() => {
    let interval = null
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((timer) => {
          if (timer <= 1) {
            setCanResend(true)
            return 0
          }
          return timer - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [otpTimer])

  const fetchCountries = async () => {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all?fields=name,idd,flag")
      const data = await response.json()
      const formattedCountries = data
        .filter((country) => country.idd?.root && country.idd?.suffixes)
        .map((country) => ({
          name: country.name.common,
          code: country.idd.root + (country.idd.suffixes[0] || ""),
          flag: country.flag,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

      dispatch(setCountries(formattedCountries))
      dispatch(setSelectedCountry(formattedCountries.find((c) => c.name === "India") || formattedCountries[0]))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch countries",
        variant: "destructive",
      })
    }
  }

  const onPhoneSubmit = async (data) => {
    dispatch(setLoading(true))
    setError("")
    setSuccess("")
    setIsTrialLimitation(false)
    setDevelopmentMode(false)

    // Format phone number with country code
    const phoneNumber = `${selectedCountry?.code}${data.phone}`
    setFullPhoneNumber(phoneNumber)

    console.log(`Attempting to send SMS to: ${phoneNumber}`)

    try {
      const result = await sendOTP(phoneNumber)

      if (result.success) {
        dispatch(setOtpSent(true))
        setStep("otp")
        setOtpTimer(60)
        setCanResend(false)

        if (result.developmentMode) {
          setDevelopmentMode(true)
          setDevelopmentOTP(result.otp)
          setSuccess(`Development Mode: SMS bypassed. OTP: ${result.otp}`)
        } else {
          setSuccess(`SMS sent successfully to ${phoneNumber}`)
        }

        toast({
          title: result.developmentMode ? "Development Mode Active" : "SMS Sent Successfully",
          description: result.developmentMode
            ? `OTP: ${result.otp} (Development Mode)`
            : `Verification code sent to ${phoneNumber}`,
        })
      } else {
        if (result.isTrialLimitation) {
          setIsTrialLimitation(true)
          setError(result.error)
        } else {
          setError(result.error)
        }

        toast({
          title: result.isTrialLimitation ? "Trial Account Limitation" : "Failed to Send SMS",
          description: result.error || "Please check your phone number and try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Phone submit error:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: "Failed to send SMS. Please check your phone number and try again.",
        variant: "destructive",
      })
    } finally {
      dispatch(setLoading(false))
    }
  }

  const onOtpSubmit = async (data) => {
    dispatch(setLoading(true))
    setError("")
    setSuccess("")

    try {
      const result = await verifyOTP(fullPhoneNumber, data.otp)

      if (result.success) {
        const user = {
          id: Date.now(),
          phone: fullPhoneNumber,
          name: "User",
          avatar: null,
        }

        dispatch(loginSuccess(user))
        localStorage.setItem("user", JSON.stringify(user))
        setSuccess("Login successful! Welcome to Gemini Chat!")

        toast({
          title: "Login Successful",
          description: "Welcome to Gemini Chat!",
        })
      } else {
        setError(result.error)
        toast({
          title: "Verification Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("OTP submit error:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return

    dispatch(setLoading(true))
    setError("")
    setSuccess("")
    setIsTrialLimitation(false)

    try {
      const result = await sendOTP(fullPhoneNumber)

      if (result.success) {
        setOtpTimer(60)
        setCanResend(false)
        otpForm.reset()

        if (result.developmentMode) {
          setDevelopmentMode(true)
          setDevelopmentOTP(result.otp)
          setSuccess(`Development Mode: New OTP: ${result.otp}`)
        } else {
          setSuccess(`New SMS sent to ${fullPhoneNumber}`)
        }

        toast({
          title: result.developmentMode ? "Development Mode Active" : "SMS Resent",
          description: result.developmentMode
            ? `New OTP: ${result.otp}`
            : `New verification code sent to ${fullPhoneNumber}`,
        })
      } else {
        if (result.isTrialLimitation) {
          setIsTrialLimitation(true)
        }
        setError(result.error)
        toast({
          title: "Failed to Resend SMS",
          description: result.error || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Resend error:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: "Failed to resend SMS. Please try again.",
        variant: "destructive",
      })
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            {step === "phone" ? <Phone className="w-6 h-6 text-white" /> : <Shield className="w-6 h-6 text-white" />}
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === "phone" ? "Welcome to Gemini" : "Verify SMS Code"}
          </CardTitle>
          <CardDescription>
            {step === "phone" ? "Enter your phone number to get started" : "Enter the 6-digit code sent to your phone"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Trial Account Limitation Alert */}
          {isTrialLimitation && (
            <Alert className="mb-4 border-orange-200 bg-orange-50 text-orange-800">
              <CreditCard className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Twilio Trial Account Limitation</p>
                  <p className="text-sm">To send SMS to any phone number, you need to:</p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    <li>
                      <strong>Upgrade your Twilio account</strong> (recommended) - Remove trial limitations
                    </li>
                    <li>
                      <strong>Add phone numbers to verified list</strong> - Go to Twilio Console → Phone Numbers →
                      Verified Caller IDs
                    </li>
                    <li>
                      <strong>Use development mode</strong> - Set BYPASS_SMS=true in .env.local for testing
                    </li>
                  </ul>
                  <div className="mt-2 pt-2 border-t border-orange-200">
                    <a
                      href="https://console.twilio.com/us1/billing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      → Upgrade Twilio Account
                    </a>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Development Mode Alert */}
          {developmentMode && (
            <Alert className="mb-4 border-blue-200 bg-blue-50 text-blue-800">
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">🔧 Development Mode Active</p>
                  <p className="text-sm">
                    SMS sending is bypassed. Use this OTP: <strong>{developmentOTP}</strong>
                  </p>
                  <p className="text-xs">To enable real SMS, remove BYPASS_SMS from .env.local</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {step === "phone" ? (
            <>
              <Alert className="mb-4">
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  You'll receive a real SMS with verification code via Twilio.
                  <br />
                  <strong>Note:</strong> Trial accounts can only send to verified numbers.
                </AlertDescription>
              </Alert>

              <Form {...phoneForm}>
                <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country</label>
                    <Select
                      value={selectedCountry?.name}
                      onValueChange={(value) => {
                        const country = countries.find((c) => c.name === value)
                        dispatch(setSelectedCountry(country))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {countries.map((country) => (
                          <SelectItem key={country.name} value={country.name}>
                            <div className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.name}</span>
                              <span className="text-muted-foreground">({country.code})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <FormField
                    control={phoneForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                              <span className="text-sm">{selectedCountry?.code}</span>
                            </div>
                            <Input placeholder="Enter phone number" className="rounded-l-none" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending SMS...
                      </>
                    ) : (
                      "Send SMS Code"
                    )}
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                <Alert className="mb-4">
                  <MessageSquare className="h-4 w-4" />
                  <AlertDescription>
                    {developmentMode ? (
                      <>
                        <strong>Development Mode:</strong> Use OTP: <strong>{developmentOTP}</strong>
                        <br />
                        Phone: <span className="font-medium">{fullPhoneNumber}</span>
                      </>
                    ) : (
                      <>
                        SMS sent to: <span className="font-medium">{fullPhoneNumber}</span>
                        <br />
                        Check your messages for the 6-digit verification code.
                      </>
                    )}
                  </AlertDescription>
                </Alert>

                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter SMS Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000000"
                          className="text-center text-lg tracking-widest"
                          maxLength={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-center text-sm text-muted-foreground">
                  {otpTimer > 0 ? (
                    <span>Resend SMS in {otpTimer} seconds</span>
                  ) : (
                    <>
                      Didn't receive the SMS?{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={handleResendOTP}
                        disabled={!canResend || loading}
                      >
                        Resend SMS
                      </Button>
                    </>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setStep("phone")
                    dispatch(setOtpSent(false))
                    setOtpTimer(0)
                    setCanResend(true)
                    phoneForm.reset()
                    otpForm.reset()
                    setError("")
                    setSuccess("")
                    setIsTrialLimitation(false)
                    setDevelopmentMode(false)
                  }}
                >
                  Change Phone Number
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
