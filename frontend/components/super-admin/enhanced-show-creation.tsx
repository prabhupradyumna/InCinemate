"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  Film,
  MapPin,
  Monitor,
  Settings,
  DollarSign,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  listTenants,
  getMoviesByTenant,
  getTheatresByTenant,
  getAuditoriumsByTheatre,
  createShow,
  getAuditoriumSeats,
  bulkUpdateShowSeatPricing,
} from "@/lib/superadmin";
import { PricingBuilder } from "./pricing-builder";

interface ShowCreationData {
  tenant_id: string;
  movie_id: string;
  auditorium_id: string;
  show_datetime: string;
  status: string;
  pricing_mode: "simple" | "advanced";
  simple_pricing: {
    premium: number;
    regular: number;
    vip?: number;
  };
  advanced_pricing?: Array<{
    seat_id: string;
    price: number;
  }>;
}

interface EnhancedShowCreationProps {
  onShowCreated?: (show: any) => void;
  onCancel?: () => void;
}

export function EnhancedShowCreation({
  onShowCreated,
  onCancel,
}: EnhancedShowCreationProps) {
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<ShowCreationData>({
    tenant_id: "",
    movie_id: "",
    auditorium_id: "",
    show_datetime: "",
    status: "scheduled",
    pricing_mode: "simple",
    simple_pricing: {
      premium: 300,
      regular: 200,
      vip: 500,
    },
  });

  // Data loading state
  const [tenants, setTenants] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [theatres, setTheatres] = useState<any[]>([]);
  const [auditoriums, setAuditoriums] = useState<any[]>([]);
  const [auditoriumSeats, setAuditoriumSeats] = useState<any[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [showDate, setShowDate] = useState("");
  const [showTime, setShowTime] = useState("");

  // Load initial data
  useEffect(() => {
    loadTenants();
  }, []);

  // Load movies and theatres when tenant changes
  useEffect(() => {
    if (formData.tenant_id) {
      loadMovies(formData.tenant_id);
      loadTheatres(formData.tenant_id);
    }
  }, [formData.tenant_id]);

  // Load auditoriums when theatre changes
  useEffect(() => {
    if (formData.auditorium_id) {
      loadAuditoriumSeats(formData.auditorium_id);
    }
  }, [formData.auditorium_id]);

  const loadTenants = async () => {
    try {
      const data = await listTenants();
      setTenants(data || []);
    } catch (error) {
      console.error("Failed to load tenants:", error);
      toast({
        title: "Error",
        description: "Failed to load tenants",
        variant: "destructive",
      });
    }
  };

  const loadMovies = async (tenantId: string) => {
    try {
      const selectedTenantData = tenants.find((t) => t.id === tenantId);
      const actualTenantId = selectedTenantData?.tenant_id || tenantId;
      const data = await getMoviesByTenant(actualTenantId);
      setMovies(data || []);
    } catch (error) {
      console.error("Failed to load movies:", error);
      toast({
        title: "Error",
        description: "Failed to load movies",
        variant: "destructive",
      });
    }
  };

  const loadTheatres = async (tenantId: string) => {
    try {
      const selectedTenantData = tenants.find((t) => t.id === tenantId);
      const actualTenantId = selectedTenantData?.tenant_id || tenantId;
      const data = await getTheatresByTenant(actualTenantId);
      setTheatres(data || []);
    } catch (error) {
      console.error("Failed to load theatres:", error);
      toast({
        title: "Error",
        description: "Failed to load theatres",
        variant: "destructive",
      });
    }
  };

  const loadAuditoriums = async (theatreId: string) => {
    try {
      const data = await getAuditoriumsByTheatre(theatreId);
      setAuditoriums(data || []);
    } catch (error) {
      console.error("Failed to load auditoriums:", error);
      toast({
        title: "Error",
        description: "Failed to load auditoriums",
        variant: "destructive",
      });
    }
  };

  const loadAuditoriumSeats = async (auditoriumId: string) => {
    try {
      console.log("Loading seats for auditorium:", auditoriumId);
      const data = await getAuditoriumSeats(auditoriumId);
      console.log("Loaded auditorium seats:", data);
      setAuditoriumSeats(data || []);
    } catch (error) {
      console.error("Failed to load auditorium seats:", error);
      toast({
        title: "Error",
        description: "Failed to load auditorium seats",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof ShowCreationData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSimplePricingChange = (category: string, value: number) => {
    console.log("Simple pricing changed:", category, value);
    setFormData((prev) => ({
      ...prev,
      simple_pricing: {
        ...prev.simple_pricing,
        [category]: value,
      },
    }));
  };

  const handleAdvancedPricingChange = (
    seatPricing: Array<{ seat_id: string; price: number }>
  ) => {
    console.log("Advanced pricing changed:", seatPricing);
    setFormData((prev) => ({
      ...prev,
      advanced_pricing: seatPricing,
    }));
  };

  const validateForm = () => {
    console.log("Validating form...");
    console.log("Form data:", formData);
    console.log("Show date:", showDate);
    console.log("Show time:", showTime);

    if (
      !formData.tenant_id ||
      !formData.movie_id ||
      !formData.auditorium_id ||
      !showDate ||
      !showTime
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    if (formData.pricing_mode === "simple") {
      console.log("Validating simple pricing:", formData.simple_pricing);
      if (
        !formData.simple_pricing.premium ||
        !formData.simple_pricing.regular
      ) {
        toast({
          title: "Validation Error",
          description: "Please set pricing for all seat categories",
          variant: "destructive",
        });
        return false;
      }
    } else {
      console.log("Validating advanced pricing:", formData.advanced_pricing);
      if (
        !formData.advanced_pricing ||
        formData.advanced_pricing.length === 0
      ) {
        toast({
          title: "Validation Error",
          description: "Please set pricing for at least one seat",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleCreateShow = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const showDatetime = `${showDate}T${showTime}:00`;

      // Find the selected tenant to get the database ID (UUID) for backend lookup
      const selectedTenantData = tenants.find(
        (t) => t.id === formData.tenant_id
      );
      const tenantDbId = selectedTenantData?.id || formData.tenant_id;

      // Create the show first
      const showPayload = {
        tenant_id: tenantDbId,
        movie_id: formData.movie_id,
        auditorium_id: formData.auditorium_id,
        show_datetime: showDatetime,
        status: formData.status,
      };

      const show = await createShow(showPayload);
      console.log("Show created successfully:", show);
      console.log("Show ID:", show?.id);
      console.log("Show object keys:", Object.keys(show || {}));

      // Then set the pricing based on the mode
      console.log("=== PRICING DEBUG ===");
      console.log("Pricing mode:", formData.pricing_mode);
      console.log("Auditorium seats:", auditoriumSeats);
      console.log("Simple pricing:", formData.simple_pricing);
      console.log("Advanced pricing:", formData.advanced_pricing);
      console.log(
        "Advanced pricing length:",
        formData.advanced_pricing?.length || 0
      );
      console.log("=====================");

      if (auditoriumSeats.length === 0) {
        toast({
          title: "Warning",
          description:
            "No seats found for this auditorium. Please configure seats first.",
          variant: "destructive",
        });
        return;
      }

      try {
        if (formData.pricing_mode === "simple") {
          console.log("=== SIMPLE PRICING MODE ===");
          // Convert simple pricing to seat-specific pricing
          const seatPricing = auditoriumSeats.map((seat) => ({
            seat_id: seat.id,
            price:
              formData.simple_pricing[seat.category?.toLowerCase()] ||
              formData.simple_pricing.regular,
          }));

          console.log("Generated seat pricing:", seatPricing);
          console.log(
            "Calling bulkUpdateShowSeatPricing with show ID:",
            show.id
          );

          const pricingResult = await bulkUpdateShowSeatPricing(show.id, {
            seat_pricing: seatPricing,
          });
          console.log("Pricing update result:", pricingResult);
        } else if (formData.pricing_mode === "advanced") {
          console.log("=== ADVANCED PRICING MODE ===");

          if (
            formData.advanced_pricing &&
            formData.advanced_pricing.length > 0
          ) {
            // Use the advanced pricing directly
            console.log("Using advanced pricing:", formData.advanced_pricing);
            console.log(
              "Calling bulkUpdateShowSeatPricing with show ID:",
              show.id
            );

            const pricingResult = await bulkUpdateShowSeatPricing(show.id, {
              seat_pricing: formData.advanced_pricing,
            });
            console.log("Pricing update result:", pricingResult);
          } else {
            // Fallback: Generate pricing from simple pricing for advanced mode
            console.log(
              "No advanced pricing set, falling back to simple pricing"
            );
            const seatPricing = auditoriumSeats.map((seat) => ({
              seat_id: seat.id,
              price:
                formData.simple_pricing[seat.category?.toLowerCase()] ||
                formData.simple_pricing.regular,
            }));

            console.log("Generated fallback seat pricing:", seatPricing);
            console.log(
              "Calling bulkUpdateShowSeatPricing with show ID:",
              show.id
            );

            const pricingResult = await bulkUpdateShowSeatPricing(show.id, {
              seat_pricing: seatPricing,
            });
            console.log("Pricing update result:", pricingResult);
          }
        } else {
          console.log("=== NO PRICING DATA ===");
          console.log("formData.pricing_mode:", formData.pricing_mode);
          console.log("formData.advanced_pricing:", formData.advanced_pricing);
          console.log(
            "formData.advanced_pricing?.length:",
            formData.advanced_pricing?.length
          );
          console.log("No pricing data to apply!");
        }
      } catch (pricingError) {
        console.error("Error updating pricing:", pricingError);
        toast({
          title: "Pricing Error",
          description:
            "Show created but pricing failed to update. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Show created successfully with pricing",
      });

      if (onShowCreated) {
        onShowCreated(show);
      }

      // Reset form
      setFormData({
        tenant_id: "",
        movie_id: "",
        auditorium_id: "",
        show_datetime: "",
        status: "scheduled",
        pricing_mode: "simple",
        simple_pricing: {
          premium: 300,
          regular: 200,
          vip: 500,
        },
      });
      setShowDate("");
      setShowTime("");
      setActiveTab("basic");
    } catch (error) {
      console.error("Failed to create show:", error);
      toast({
        title: "Error",
        description: "Failed to create show",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedTenant = tenants.find((t) => t.id === formData.tenant_id);
  const selectedMovie = movies.find((m) => m.id === formData.movie_id);
  const selectedAuditorium = auditoriums.find(
    (a) => a.id === formData.auditorium_id
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Show</h1>
          <p className="text-muted-foreground mt-2">
            Set up a new movie show with flexible pricing options
          </p>
        </div>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      {/* Progress Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Basic Details
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Review & Create
          </TabsTrigger>
        </TabsList>

        {/* Basic Details Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Show Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tenant Selection */}
                <div className="space-y-2">
                  <Label htmlFor="tenant">Tenant *</Label>
                  <Select
                    value={formData.tenant_id}
                    onValueChange={(value) => {
                      handleInputChange("tenant_id", value);
                      // Reset dependent fields
                      setFormData((prev) => ({
                        ...prev,
                        movie_id: "",
                        auditorium_id: "",
                      }));
                      setMovies([]);
                      setTheatres([]);
                      setAuditoriums([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Movie Selection */}
                <div className="space-y-2">
                  <Label htmlFor="movie">Movie *</Label>
                  <Select
                    value={formData.movie_id}
                    onValueChange={(value) => {
                      handleInputChange("movie_id", value);
                      // Reset dependent fields
                      setFormData((prev) => ({
                        ...prev,
                        auditorium_id: "",
                      }));
                      setAuditoriums([]);
                    }}
                    disabled={!formData.tenant_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select movie" />
                    </SelectTrigger>
                    <SelectContent>
                      {movies.map((movie) => (
                        <SelectItem key={movie.id} value={movie.id}>
                          <div className="flex items-center gap-2">
                            <Film className="h-4 w-4" />
                            {movie.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Theatre Selection */}
                <div className="space-y-2">
                  <Label htmlFor="theatre">Theatre *</Label>
                  <Select
                    onValueChange={(value) => {
                      loadAuditoriums(value);
                      // Reset dependent fields
                      setFormData((prev) => ({
                        ...prev,
                        auditorium_id: "",
                      }));
                    }}
                    disabled={!formData.tenant_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theatre" />
                    </SelectTrigger>
                    <SelectContent>
                      {theatres.map((theatre) => (
                        <SelectItem key={theatre.id} value={theatre.id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {theatre.name} - {theatre.city}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Auditorium Selection */}
                <div className="space-y-2">
                  <Label htmlFor="auditorium">Auditorium *</Label>
                  <Select
                    value={formData.auditorium_id}
                    onValueChange={(value) =>
                      handleInputChange("auditorium_id", value)
                    }
                    disabled={!formData.tenant_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select auditorium" />
                    </SelectTrigger>
                    <SelectContent>
                      {auditoriums.map((auditorium) => (
                        <SelectItem key={auditorium.id} value={auditorium.id}>
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            {auditorium.name} ({auditorium.total_seats} seats)
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Show Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">Show Date *</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={showDate}
                      onChange={(e) => setShowDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                {/* Show Time */}
                <div className="space-y-2">
                  <Label htmlFor="time">Show Time *</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={showTime}
                      onChange={(e) => setShowTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Selection Summary */}
              {(selectedTenant || selectedMovie || selectedAuditorium) && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-3">Selection Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {selectedTenant && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Tenant</Badge>
                        <span>{selectedTenant.name}</span>
                      </div>
                    )}
                    {selectedMovie && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Movie</Badge>
                        <span>{selectedMovie.title}</span>
                      </div>
                    )}
                    {selectedAuditorium && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Auditorium</Badge>
                        <span>{selectedAuditorium.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => setActiveTab("pricing")}
                  disabled={
                    !formData.tenant_id ||
                    !formData.movie_id ||
                    !formData.auditorium_id ||
                    !showDate ||
                    !showTime
                  }
                >
                  Next: Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!formData.auditorium_id ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Please select an auditorium first to configure pricing</p>
                </div>
              ) : auditoriumSeats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-2">No seats configured</p>
                  <p className="text-sm">
                    This auditorium has no seats configured. Please configure
                    seats first using the Auditorium Configurator.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" asChild>
                      <a
                        href="/super-admin/auditoriums/configure"
                        target="_blank"
                      >
                        Configure Auditorium
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <PricingBuilder
                  auditoriumId={formData.auditorium_id}
                  auditoriumSeats={auditoriumSeats}
                  pricingMode={formData.pricing_mode}
                  simplePricing={formData.simple_pricing}
                  advancedPricing={formData.advanced_pricing}
                  onPricingModeChange={(mode) =>
                    handleInputChange("pricing_mode", mode)
                  }
                  onSimplePricingChange={handleSimplePricingChange}
                  onAdvancedPricingChange={handleAdvancedPricingChange}
                />
              )}

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setActiveTab("basic")}>
                  Back: Basic Details
                </Button>
                <Button
                  onClick={() => setActiveTab("review")}
                  disabled={
                    !formData.auditorium_id || auditoriumSeats.length === 0
                  }
                >
                  Next: Review & Create
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Review & Create Show
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Show Details Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Show Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tenant:</span>
                      <span>{selectedTenant?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Movie:</span>
                      <span>{selectedMovie?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Auditorium:</span>
                      <span>{selectedAuditorium?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Date & Time:
                      </span>
                      <span>
                        {showDate} at {showTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline">{formData.status}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Pricing Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mode:</span>
                      <Badge
                        variant={
                          formData.pricing_mode === "simple"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {formData.pricing_mode === "simple"
                          ? "Simple"
                          : "Advanced"}
                      </Badge>
                    </div>

                    {formData.pricing_mode === "simple" ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Premium:
                          </span>
                          <span>AED {formData.simple_pricing.premium}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Regular:
                          </span>
                          <span>AED {formData.simple_pricing.regular}</span>
                        </div>
                        {formData.simple_pricing.vip && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">VIP:</span>
                            <span>AED {formData.simple_pricing.vip}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Custom Seats:
                        </span>
                        <span>
                          {formData.advanced_pricing?.length || 0} seats
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("pricing")}
                >
                  Back: Pricing
                </Button>
                <Button
                  onClick={handleCreateShow}
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? "Creating..." : "Create Show"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
