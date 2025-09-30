"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuditoriumConfigurator } from "@/components/super-admin/auditorium-configurator";
import { useApiCall } from "@/lib/hooks";
import {
  getAuditoriumRequest,
  createAuditoriumConfiguration,
  getAuditorium,
  getAuditoriumSeats,
  updateAuditoriumConfiguration,
} from "@/lib/superadmin";

export default function AuditoriumConfigurationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const requestId = params.requestId as string;

  const [request, setRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [auditoriumId, setAuditoriumId] = useState<string | null>(null);
  const [initialSeats, setInitialSeats] = useState<any[]>([]);
  const [justSaved, setJustSaved] = useState(false);

  // If navigating from auditoriums list, requestId is actually auditorium id (not a request)
  const isAuditoriumId =
    requestId && requestId.startsWith && !requestId.startsWith("req_");
  const {
    data: requestData,
    loading,
    error,
    execute,
  } = useApiCall(
    () =>
      isAuditoriumId
        ? getAuditorium(requestId)
        : getAuditoriumRequest(requestId),
    [requestId]
  );

  useEffect(() => {
    (async () => {
      if (!requestData) return;
      const data = (requestData as any).data || requestData;
      setRequest(data);
      // Derive auditorium id and fetch existing seats if editing an auditorium
      const audId = isAuditoriumId ? data?.id || requestId : null;
      if (audId) {
        setAuditoriumId(audId);
        try {
          const seats = await getAuditoriumSeats(audId);
          setInitialSeats(seats || []);
        } catch {}
      }
      setIsLoading(false);
    })();
  }, [requestData]);

  // Trigger the API call on mount and when requestId changes
  useEffect(() => {
    execute();
  }, [execute]);

  const handleSaveConfiguration = async (seatMapData: any) => {
    try {
      setIsSaving(true);
      if (auditoriumId) {
        await updateAuditoriumConfiguration(auditoriumId, {
          name: seatMapData.name,
          // Ensure seat_map is always an array; allow empty array to clear seats
          seat_map: Array.isArray(seatMapData.seat_map)
            ? seatMapData.seat_map
            : [],
          configuration: seatMapData.configuration,
        });
        // Live refresh: re-fetch seats and rehydrate editor
        try {
          const latest = await getAuditoriumSeats(auditoriumId);
          setInitialSeats(latest || []);
        } catch {}
        setJustSaved(true);
      } else {
        // Creating from request
        await createAuditoriumConfiguration(seatMapData);
      }

      toast({
        title: "Success",
        description: "Auditorium configuration saved successfully",
      });

      // Stay on page for continuous editing when editing an existing auditorium
      if (!auditoriumId) {
        router.push("/super-admin?tab=auditoriums");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save auditorium configuration",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading auditorium...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load auditorium</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Configure Auditorium</h1>
            <p className="text-muted-foreground">
              Create seat map for {request.theatre?.name || "Unknown Theatre"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={request.status === "approved" ? "default" : "secondary"}
          >
            {request.status}
          </Badge>
        </div>
      </div>

      {/* Request Details */}
      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Theatre Information</h4>
              <p>
                <strong>Name:</strong> {request.theatre?.name || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {request.theatre?.address || "N/A"}
              </p>
              <p>
                <strong>City:</strong> {request.theatre?.city || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Request Information</h4>
              <p>
                <strong>Submitted by:</strong> {request.tenant_id || "N/A"}
              </p>
              <p>
                <strong>Notes:</strong> {request.notes || "No additional notes"}
              </p>
              <p>
                <strong>Submitted:</strong>{" "}
                {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Blueprint Actions */}
          {request.blueprint_url && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Blueprint</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Blueprint
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auditorium Configurator */}
      <AuditoriumConfigurator
        request={request}
        onSave={handleSaveConfiguration}
        isSaving={isSaving}
        initialSeats={initialSeats}
        justSaved={justSaved}
        isEditing={Boolean(auditoriumId)}
      />
    </div>
  );
}
