"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

interface TermsConditionsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  movieTitle: string;
  showTime: string;
  venue: string;
  totalAmount: number;
}

export function TermsConditionsPopup({
  isOpen,
  onClose,
  onAccept,
  movieTitle,
  showTime,
  venue,
  totalAmount,
}: TermsConditionsPopupProps) {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            Terms & Conditions
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Booking Summary */}
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <h3 className="font-semibold text-lg mb-2 text-foreground">
              {movieTitle}
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong>Venue:</strong> {venue}
              </p>
              <p>
                <strong>Show Time:</strong> {showTime}
              </p>
              <p>
                <strong>Total Amount:</strong> AED {totalAmount}
              </p>
            </div>
          </div>

          {/* Terms Content */}
          <ScrollArea className="h-64 w-full border rounded-md p-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="font-semibold text-primary">1.</span>
                <p className="text-foreground">
                  Please pick up your tickets at least 20 mins before showtime
                  to avoid rush at the counter.
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <span className="font-semibold text-primary">2.</span>
                <p className="text-foreground">
                  Outside food & beverages are not allowed inside the cinema
                  premises.
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <span className="font-semibold text-primary">3.</span>
                <p className="text-foreground">
                  Ticket is compulsory for children of 3 years & above.
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <span className="font-semibold text-primary">4.</span>
                <p className="text-foreground">
                  Ticket for "A" rated movie should not be purchased for people
                  under 18 years of age. There won't be a refund for tickets
                  booked in such cases.
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <span className="font-semibold text-primary">5.</span>
                <p className="text-foreground">
                  Handbags, Laptops/Tabs, cameras and all other electronic items
                  are not allowed inside cinema premises.
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <span className="font-semibold text-primary">6.</span>
                <p className="text-foreground">
                  Smoking is strictly not permitted inside the cinema premises.
                  Cigarettes/lighters/matchsticks/Gutkha/Pan masala etc. will
                  not be allowed.
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <span className="font-semibold text-primary">7.</span>
                <p className="text-foreground">
                  Cinema reserves the Right of Admission.
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <span className="font-semibold text-primary">8.</span>
                <p className="text-foreground">
                  People under the influence of Alcohol/Drugs will not be
                  allowed inside the cinema premises.
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <span className="font-semibold text-primary">9.</span>
                <p className="text-foreground">
                  Tickets once purchased cannot be exchanged or
                  adjusted/transferred for any other show or date.
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <span className="font-semibold text-primary">10.</span>
                <p className="text-foreground">
                  Seats will be held for 15 minutes after accepting these terms.
                  Complete your payment within this time to confirm your
                  booking.
                </p>
              </div>
            </div>
          </ScrollArea>

          {/* Acceptance Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="accept-terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <label
              htmlFor="accept-terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
            >
              I have read and agree to the Terms & Conditions
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!accepted}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Accept & Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
