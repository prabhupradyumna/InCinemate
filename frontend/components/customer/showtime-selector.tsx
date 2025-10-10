"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ShowItem = {
  id: string;
  show_datetime: string;
  pricing: Record<string, number>;
};
type Auditorium = { id: string; name: string; shows: ShowItem[] };
type Theatre = {
  id: string;
  name: string;
  city?: string;
  auditoriums: Auditorium[];
};

export function ShowtimeSelector({
  open,
  onOpenChange,
  theatres = [],
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  theatres: Theatre[];
  onSelect: (showId: string) => void;
}) {
  const grouped = useMemo(() => theatres || [], [theatres]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select a showtime</DialogTitle>
          <DialogDescription>
            Choose theatre, auditorium and time to proceed to seat selection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {grouped.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No upcoming shows available.
            </div>
          )}

          {grouped.map((theatre) => (
            <div key={theatre.id} className="space-y-3">
              <div className="font-semibold">
                {theatre.name}
                {theatre.city ? ` • ${theatre.city}` : ""}
              </div>
              <div className="space-y-2">
                {theatre.auditoriums?.map((aud) => (
                  <div
                    key={aud.id}
                    className="border border-border rounded-md p-3"
                  >
                    <div className="text-sm text-muted-foreground mb-2">
                      {aud.name}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {aud.shows?.map((s) => {
                        const dt = new Date(s.show_datetime);
                        const label = isNaN(dt.getTime())
                          ? s.show_datetime
                          : dt.toLocaleString();
                        return (
                          <Button
                            key={s.id}
                            variant="outline"
                            size="sm"
                            onClick={() => onSelect(s.id)}
                          >
                            {label}
                          </Button>
                        );
                      })}
                      {(!aud.shows || aud.shows.length === 0) && (
                        <div className="text-xs text-muted-foreground">
                          No showtimes
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}


