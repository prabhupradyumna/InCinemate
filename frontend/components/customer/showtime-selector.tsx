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
      <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold">
            Select a showtime
          </DialogTitle>
          <DialogDescription className="text-base">
            Choose theatre, auditorium and time to proceed to seat selection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {grouped.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground text-lg">
                No upcoming shows available.
              </div>
            </div>
          )}

          {grouped.map((theatre) => (
            <div key={theatre.id} className="space-y-4">
              {/* Theatre Header */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {theatre.name}
                  </h3>
                  {theatre.city && (
                    <span className="text-muted-foreground text-sm">
                      • {theatre.city}
                    </span>
                  )}
                </div>
              </div>

              {/* Auditoriums */}
              <div className="space-y-3 ml-4">
                {theatre.auditoriums?.map((aud) => (
                  <div
                    key={aud.id}
                    className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Auditorium Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                      <h4 className="font-medium text-foreground">
                        {aud.name}
                      </h4>
                    </div>

                    {/* Showtimes */}
                    <div className="flex flex-wrap gap-3">
                      {aud.shows?.map((s) => {
                        const dt = new Date(s.show_datetime);
                        const label = isNaN(dt.getTime())
                          ? s.show_datetime
                          : dt.toLocaleString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            });
                        return (
                          <Button
                            key={s.id}
                            variant="outline"
                            size="sm"
                            onClick={() => onSelect(s.id)}
                            className="h-10 px-6 py-2 text-sm font-medium border-2 border-primary/20 bg-primary/5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer rounded-lg"
                          >
                            <div className="flex flex-col items-center">
                              <span className="font-semibold">{label}</span>
                              <span className="text-xs opacity-75 mt-0.5">Tap to select</span>
                            </div>
                          </Button>
                        );
                      })}
                      {(!aud.shows || aud.shows.length === 0) && (
                        <div className="text-sm text-muted-foreground italic">
                          No showtimes available
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
