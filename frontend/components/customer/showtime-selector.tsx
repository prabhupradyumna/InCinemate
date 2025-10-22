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
      <DialogContent className="w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl max-h-[90vh] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-5 rounded-2xl shadow-2xl sm:p-7 md:p-8">
        <DialogHeader className="border-b-2 border-purple-200 pb-4 md:pb-6 mb-4 md:mb-6">
          <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-extrabold text-indigo-900">
            🎬 Select Your Epic Showtime!
          </DialogTitle>
          <DialogDescription className="text-indigo-700 text-sm md:text-lg">
            Dive into the magic—pick your theatre, auditorium, and time to grab your seats!
          </DialogDescription>
        </DialogHeader>
 
        <div className="space-y-6 md:space-y-8 max-h-[65vh] sm:max-h-[70vh] md:max-h-[72vh] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-indigo-100">
          {grouped.length === 0 && (
            <div className="text-center py-12">
              <div className="text-indigo-600 text-xl font-medium">
                😞 No upcoming shows available.
              </div>
            </div>
          )}
 
          {grouped.map((theatre) => (
            <div key={theatre.id} className="space-y-5 md:space-y-6">
              {/* Theatre Header */}
              <div className="bg-white/80 rounded-2xl p-4 md:p-5 border border-purple-100 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900">
                    {theatre.name}
                  </h3>
                  {theatre.city && (
                    <span className="text-purple-600 text-sm md:text-lg">
                      • {theatre.city}
                    </span>
                  )}
                </div>
              </div>
 
              {/* Auditoriums */}
              <div className="space-y-4 ml-6 sm:ml-8 md:ml-10">
                {theatre.auditoriums?.map((aud) => (
                  <div
                    key={aud.id}
                    className="bg-white/90 border border-indigo-200 rounded-2xl p-4 md:p-5 shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    {/* Auditorium Header */}
                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-5">
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-pink-400 rounded-full"></div>
                      <h4 className="text-base md:text-xl font-medium text-gray-800">
                        {aud.name}
                      </h4>
                    </div>
 
                    {/* Showtimes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
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
                            size="lg"
                            onClick={() => onSelect(s.id)}
                            className="w-full h-14 md:h-16 px-4 md:px-6 py-2 text-base md:text-lg font-bold border-2 border-gradient-to-r from-pink-300 to-purple-400 bg-gradient-to-br from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 hover:text-white hover:border-purple-500 transition-all duration-300 rounded-xl flex items-center justify-center group overflow-hidden"
                          >
                            <div className="text-center leading-tight max-w-full">
                              <span className="block text-indigo-900 group-hover:text-white whitespace-nowrap">
                                {label}
                              </span>
                              <span className="block text-xs md:text-sm text-purple-600 group-hover:text-white whitespace-nowrap">
                                🎉 Grab Your Seat!
                              </span>
                            </div>
                          </Button>
                        );
                      })}
                      {(!aud.shows || aud.shows.length === 0) && (
                        <div className="text-gray-500 text-lg italic">
                          No showtimes yet—stay tuned!
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
