"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Smartphone, Shield } from "lucide-react";

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  onBack: () => void;
  selectedGateway: string;
  onGatewaySelect: (gateway: string) => void;
  totalAmount: number;
  movieTitle: string;
  showTime: string;
  venue: string;
}

const paymentGateways = [
  {
    id: "phonepe",
    name: "PhonePe",
    description: "Pay with PhonePe UPI, Cards & Wallets",
    icon: Smartphone,
    color: "bg-purple-500",
    features: ["UPI", "Cards", "Wallets", "Net Banking"],
    popular: true,
  },
];

export function PaymentGatewayModal({
  isOpen,
  onClose,
  onProceed,
  onBack,
  selectedGateway,
  onGatewaySelect,
  totalAmount,
  movieTitle,
  showTime,
  venue,
}: PaymentGatewayModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Select Payment Method</span>
            <Badge variant="outline" className="text-xs">
              ₹{totalAmount.toFixed(0)}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Booking Summary */}
          <div className="space-y-2 p-3 bg-muted/20 rounded-lg border border-border/30">
            <h4 className="font-medium text-sm">Booking Summary</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>{movieTitle}</p>
              <p>{showTime} • {venue}</p>
            </div>
          </div>

          <Separator />

          {/* Payment Gateways */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Choose Payment Method</h4>
            
            {paymentGateways.map((gateway) => {
              const Icon = gateway.icon;
              const isSelected = selectedGateway === gateway.id;
              
              return (
                <div
                  key={gateway.id}
                  className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => onGatewaySelect(gateway.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${gateway.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-sm">{gateway.name}</h5>
                        {gateway.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {gateway.description}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {gateway.features.map((feature) => (
                          <Badge
                            key={feature}
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 bg-muted/20 rounded-lg border border-border/30">
            <Shield className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground">
                Secure Payment
              </p>
              <p>Your payment is processed securely through PhonePe's encrypted gateway.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              onClick={onProceed}
              disabled={!selectedGateway}
            >
              {selectedGateway ? `Pay ₹${totalAmount.toFixed(0)} with ${paymentGateways.find(g => g.id === selectedGateway)?.name}` : "Select Payment Method"}
            </Button>
            
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={onBack}
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
