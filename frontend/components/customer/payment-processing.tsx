"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, AlertCircle } from "lucide-react"

interface PaymentProcessingProps {
  onComplete: () => void
  onError: (error: string) => void
}

export function PaymentProcessing({ onComplete, onError }: PaymentProcessingProps) {
  const [step, setStep] = useState<"processing" | "success" | "error">("processing")

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Simulate payment processing steps
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Simulate random success/failure for demo
        const success = Math.random() > 0.1 // 90% success rate

        if (success) {
          setStep("success")
          setTimeout(() => {
            onComplete()
          }, 1500)
        } else {
          setStep("error")
          onError("Payment failed. Please try again.")
        }
      } catch (error) {
        setStep("error")
        onError("An unexpected error occurred.")
      }
    }

    processPayment()
  }, [onComplete, onError])

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          {step === "processing" && (
            <>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Processing Payment</h3>
                <p className="text-muted-foreground">Please wait while we process your payment...</p>
              </div>
            </>
          )}

          {step === "success" && (
            <>
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Payment Successful</h3>
                <p className="text-muted-foreground">Redirecting to confirmation...</p>
              </div>
            </>
          )}

          {step === "error" && (
            <>
              <div className="flex justify-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Payment Failed</h3>
                <p className="text-muted-foreground">Please check your payment details and try again.</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
