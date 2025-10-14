"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface PaymentStatus {
  status: string;
  bookingId: string;
  merchantOrderId: string;
  amount: number;
  paymentStatus: string;
  bookingStatus: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const merchantOrderId = searchParams.get('merchantOrderId');

  useEffect(() => {
    if (!merchantOrderId) {
      setError('Missing merchant order ID');
      setLoading(false);
      return;
    }

    // checkPaymentStatus();
  }, [merchantOrderId]);

  // const checkPaymentStatus = async () => {
  //   if (!merchantOrderId) return;
    
  //   try {
  //     // const { checkPaymentStatus } = await import("@/lib/api");
      
  //     const response = await checkPaymentStatus(merchantOrderId);

  //     if (response.success) {
  //       setPaymentStatus(response.data);
  //     } else {
  //       setError(response.error || 'Failed to check payment status');
  //     }
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to check payment status');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-8 w-8 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-8 w-8 text-yellow-500" />;
      default:
        return <AlertCircle className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'FAILED':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'PENDING':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'Payment Successful! Your booking has been confirmed.';
      case 'FAILED':
        return 'Payment Failed. Please try again or contact support.';
      case 'PENDING':
        return 'Payment is being processed. Please wait...';
      default:
        return 'Payment status unknown. Please contact support.';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner />
            <p className="mt-4 text-muted-foreground">Checking payment status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Error</h2>
            <p className="text-muted-foreground text-center mb-6">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paymentStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Payment Data</h2>
            <p className="text-muted-foreground text-center mb-6">
              Unable to retrieve payment information.
            </p>
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payment Status</span>
            <Badge variant="outline" className="text-xs">
              AED {paymentStatus.amount.toFixed(0)}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Display */}
          <div className={`p-4 rounded-lg border ${getStatusColor(paymentStatus.status)}`}>
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(paymentStatus.status)}
              <div>
                <h3 className="font-semibold">
                  {paymentStatus.status === 'SUCCESS' ? 'Payment Successful' : 
                   paymentStatus.status === 'FAILED' ? 'Payment Failed' : 
                   paymentStatus.status === 'PENDING' ? 'Payment Pending' : 'Unknown Status'}
                </h3>
                <p className="text-sm opacity-80">
                  {getStatusMessage(paymentStatus.status)}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Booking Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID:</span>
                <span className="font-mono text-xs">{paymentStatus.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono text-xs">{paymentStatus.merchantOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">AED {paymentStatus.amount.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status:</span>
                <Badge variant="outline" className="text-xs">
                  {paymentStatus.paymentStatus}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking Status:</span>
                <Badge variant="outline" className="text-xs">
                  {paymentStatus.bookingStatus}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-2">
            {paymentStatus.status === 'SUCCESS' && (
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => router.push(`/booking/confirmation?booking_id=${paymentStatus.bookingId}`)}
              >
                View Booking Details
              </Button>
            )}
            
            {paymentStatus.status === 'FAILED' && (
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={() => router.push('/')}
              >
                Try Again
              </Button>
            )}

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/')}
            >
              Go to Homepage
            </Button>
          </div>

          {/* Additional Info */}
          {paymentStatus.status === 'PENDING' && (
            <div className="text-xs text-muted-foreground text-center">
              <p>Your payment is being processed. You will receive a confirmation email once completed.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
