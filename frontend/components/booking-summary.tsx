"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, CreditCard, User, Lock } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { CustomerDetailsModal } from "@/components/customer-details-modal";

interface ShowData {
  movie: {
    id: string;
    title: string;
    genre: string;
    duration: number;
    rating: string;
    posterUrl: string;
  };
  venue: {
    name: string;
    address: string;
  };
  screen: {
    name: string;
    seatMap: {
      rows: Array<{
        row: string;
        seats: number[];
        type: "premium" | "regular";
      }>;
    };
  };
  showtime: {
    date: string;
    time: string;
    pricing: {
      premium: number;
      regular: number;
    };
  };
  bookedSeats: Array<{
    row: string;
    seat: number;
  }>;
}

interface BookingSummaryProps {
  showData: ShowData;
  selectedSeats?: Array<{
    row: string;
    seat: number;
    type: "premium" | "regular";
  }>;
  selectedQuantity?: number;
  onBack?: () => void;
}

export function BookingSummary({
  showData,
  selectedSeats = [],
  selectedQuantity = 1,
  onBack,
}: BookingSummaryProps) {
  const { user, refresh } = useAuth();
  const initialStep: "summary" | "payment" = "summary";
  const [step, setStep] = useState<"summary" | "payment">(initialStep);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const [customerDetails, setCustomerDetails] = useState({
    fullName: (user as any)?.fullName || (user as any)?.full_name || "",
    email: user?.email || "",
    phone: "",
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    nameOnCard: "",
  });

  // Use actual selected seats or create mock based on quantity
  const mockSelectedSeats =
    selectedSeats.length > 0
      ? selectedSeats
      : Array.from({ length: selectedQuantity }, (_, i) => ({
          row: "A",
          seat: i + 1,
          type: "premium" as const,
        }));

  const subtotal = mockSelectedSeats.reduce((total, seat) => {
    return total + showData.showtime.pricing[seat.type];
  }, 0);

  const convenienceFee = 2.5;
  const total = subtotal + convenienceFee;

  const handleContinue = async () => {
    if (step === "summary") {
      if (user) {
        // Logged in users go directly to payment
        setStep("payment");
      } else {
        // Show customer details modal for guest users
        setShowCustomerModal(true);
      }
    }
  };

  const handleCustomerDetailsSubmit = async (details: {
    fullName: string;
    email: string;
    phone: string;
  }) => {
    setCustomerDetails(details);
    setShowCustomerModal(false);

    // Trigger OTP flow for guest before allowing payment
    await handleGuestAuth();
  };

  const handleBack = () => {
    if (step === "payment") {
      setStep("summary");
    } else if (step === "summary" && onBack) {
      onBack();
    }
  };

  const handleCompleteBooking = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Redirect to confirmation page
    router.push("/booking/confirmation");
  };

  const isDetailsValid = customerDetails.fullName && !!customerDetails.phone;

  const isPaymentValid =
    paymentDetails.cardNumber &&
    paymentDetails.expiry &&
    paymentDetails.cvv &&
    paymentDetails.nameOnCard;

  // ==============================
  // Guest OTP Auth (creates user on first login)
  // ==============================
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  async function handleGuestAuth() {
    if (user) {
      setStep("payment");
      return;
    }
    try {
      setOtpError(null);
      // Require phone for SMS OTP during checkout
      const channel = "sms" as const;
      const recipient = customerDetails.phone;
      if (!recipient) {
        setOtpError("Please enter your phone number to receive OTP");
        return;
      }
      const { requestCustomerOtp, verifyCustomerOtp } = await import(
        "@/lib/api"
      );
      if (!otpRequested) {
        await requestCustomerOtp({
          phone: recipient,
          channel: channel as any,
          purpose: "login",
        });
        setOtpRequested(true);
        return;
      }
      if (otpRequested && otpCode.trim().length > 0) {
        const ok = await verifyCustomerOtp({
          phone: recipient,
          email: customerDetails.email || undefined,
          code: otpCode.trim(),
          channel: channel as any,
        });
        // After verify, token is stored and AuthProvider will pick up on next getMe/refresh.
        await refresh();
        setStep("payment");
      }
    } catch (e: any) {
      setOtpError(
        e?.response?.data?.error || e?.message || "OTP verification failed"
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card className="bg-card border-border sticky top-24">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base md:text-lg">
            <span>Booking Summary</span>
            <Badge variant="outline" className="text-xs">
              Step {step === "summary" ? "1" : "2"} of 2
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          {/* Movie Details */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm md:text-base">
              {showData.movie.title}
            </h3>
            <div className="space-y-1 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>{showData.venue.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(showData.showtime.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>{showData.showtime.time}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Selected Seats */}
          {mockSelectedSeats.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm md:text-base">
                Selected Seats
              </h4>
              <div className="space-y-1">
                {mockSelectedSeats.map((seat, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-xs md:text-sm"
                  >
                    <span>
                      {seat.row}
                      {seat.seat} ({seat.type})
                    </span>
                    <span>
                      ${showData.showtime.pricing[seat.type].toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Price Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs md:text-sm">
              <span>Convenience Fee</span>
              <span>${convenienceFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-sm md:text-base">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Form */}
          {step === "payment" && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2 text-sm md:text-base">
                  <CreditCard className="h-4 w-4" />
                  Payment Details
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="nameOnCard">Name on Card</Label>
                    <Input
                      id="nameOnCard"
                      placeholder="John Doe"
                      value={paymentDetails.nameOnCard}
                      onChange={(e) =>
                        setPaymentDetails((prev) => ({
                          ...prev,
                          nameOnCard: e.target.value,
                        }))
                      }
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentDetails.cardNumber}
                      onChange={(e) =>
                        setPaymentDetails((prev) => ({
                          ...prev,
                          cardNumber: e.target.value,
                        }))
                      }
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={paymentDetails.expiry}
                        onChange={(e) =>
                          setPaymentDetails((prev) => ({
                            ...prev,
                            expiry: e.target.value,
                          }))
                        }
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={paymentDetails.cvv}
                        onChange={(e) =>
                          setPaymentDetails((prev) => ({
                            ...prev,
                            cvv: e.target.value,
                          }))
                        }
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-start gap-2 p-3 bg-muted/20 rounded-lg border border-border/30">
                  <Lock className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">
                      Secure Payment
                    </p>
                    <p>Your payment information is encrypted and secure.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            {step === "summary" && mockSelectedSeats.length > 0 && (
              <>
                <Button className="w-full cinema-glow" onClick={handleContinue}>
                  Continue to Details
                </Button>
                {onBack && (
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={handleBack}
                  >
                    Back to Seat Selection
                  </Button>
                )}
              </>
            )}

            {step === "payment" && (
              <>
                <Button
                  className="w-full cinema-glow"
                  onClick={handleCompleteBooking}
                  disabled={!isPaymentValid || isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    `Complete Booking - $${total.toFixed(2)}`
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={handleBack}
                  disabled={isProcessing}
                >
                  Back to Details
                </Button>
              </>
            )}

            {mockSelectedSeats.length === 0 && (
              <Button className="w-full" disabled>
                Select seats to continue
              </Button>
            )}
          </div>

          {/* Terms Notice */}
          {step === "payment" && (
            <div className="text-xs text-muted-foreground text-center pt-2">
              By completing this booking, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onContinue={handleCustomerDetailsSubmit}
        showData={showData}
        selectedSeats={mockSelectedSeats}
      />
    </div>
  );
}
