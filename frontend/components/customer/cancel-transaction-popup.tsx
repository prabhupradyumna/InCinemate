"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface CancelTransactionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CancelTransactionPopup({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
}: CancelTransactionPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-lg text-foreground">
            Cancel Transaction
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Are you sure that you want to cancel the transaction?
          </p>

          <p className="text-center text-sm text-muted-foreground">
            Your selected seats will be released and made available for other
            customers.
          </p>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              No, Continue
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
