// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Switch } from "@/components/ui/switch"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { SeatMapEditor } from "@/components/admin/seat-map-editor"
// import { MapPin, Clock, DollarSign, Monitor } from "lucide-react"

// export function VenueSettings() {
//   const [venueInfo, setVenueInfo] = useState({
//     name: "Downtown Cinema",
//     address: "123 Main Street",
//     city: "New York",
//     state: "NY",
//     zipCode: "10001",
//     phone: "+1 (555) 123-4567",
//     email: "info@downtowncinema.com",
//     description: "Premium movie theater experience in the heart of downtown",
//   })

//   const [operatingHours, setOperatingHours] = useState({
//     monday: { open: "10:00", close: "23:00", closed: false },
//     tuesday: { open: "10:00", close: "23:00", closed: false },
//     wednesday: { open: "10:00", close: "23:00", closed: false },
//     thursday: { open: "10:00", close: "23:00", closed: false },
//     friday: { open: "10:00", close: "24:00", closed: false },
//     saturday: { open: "09:00", close: "24:00", closed: false },
//     sunday: { open: "11:00", close: "22:00", closed: false },
//   })

//   const [pricing, setPricing] = useState({
//     regularWeekday: 12.0,
//     premiumWeekday: 18.0,
//     regularWeekend: 15.0,
//     premiumWeekend: 22.0,
//     matineeDiscount: 20,
//     seniorDiscount: 15,
//     studentDiscount: 10,
//   })

//   const handleSaveVenueInfo = () => {
//     console.log("Saving venue info:", venueInfo)
//     // In real app, this would make an API call
//   }

//   const handleSaveOperatingHours = () => {
//     console.log("Saving operating hours:", operatingHours)
//     // In real app, this would make an API call
//   }

//   const handleSavePricing = () => {
//     console.log("Saving pricing:", pricing)
//     // In real app, this would make an API call
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h2 className="text-2xl font-bold">Venue Settings</h2>
//         <p className="text-muted-foreground">Manage your venue information, screens, and pricing</p>
//       </div>

//       <Tabs defaultValue="info" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-4 bg-secondary">
//           <TabsTrigger
//             value="info"
//             className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
//           >
//             Venue Info
//           </TabsTrigger>
//           <TabsTrigger
//             value="hours"
//             className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
//           >
//             Operating Hours
//           </TabsTrigger>
//           <TabsTrigger
//             value="pricing"
//             className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
//           >
//             Pricing
//           </TabsTrigger>
//           <TabsTrigger
//             value="screens"
//             className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
//           >
//             Screens
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="info">
//           <Card className="bg-card border-border">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <MapPin className="h-5 w-5" />
//                 Venue Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="venueName">Venue Name</Label>
//                   <Input
//                     id="venueName"
//                     value={venueInfo.name}
//                     onChange={(e) => setVenueInfo((prev) => ({ ...prev, name: e.target.value }))}
//                     className="bg-input border-border"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="phone">Phone</Label>
//                   <Input
//                     id="phone"
//                     value={venueInfo.phone}
//                     onChange={(e) => setVenueInfo((prev) => ({ ...prev, phone: e.target.value }))}
//                     className="bg-input border-border"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="address">Address</Label>
//                 <Input
//                   id="address"
//                   value={venueInfo.address}
//                   onChange={(e) => setVenueInfo((prev) => ({ ...prev, address: e.target.value }))}
//                   className="bg-input border-border"
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="city">City</Label>
//                   <Input
//                     id="city"
//                     value={venueInfo.city}
//                     onChange={(e) => setVenueInfo((prev) => ({ ...prev, city: e.target.value }))}
//                     className="bg-input border-border"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="state">State</Label>
//                   <Input
//                     id="state"
//                     value={venueInfo.state}
//                     onChange={(e) => setVenueInfo((prev) => ({ ...prev, state: e.target.value }))}
//                     className="bg-input border-border"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="zipCode">ZIP Code</Label>
//                   <Input
//                     id="zipCode"
//                     value={venueInfo.zipCode}
//                     onChange={(e) => setVenueInfo((prev) => ({ ...prev, zipCode: e.target.value }))}
//                     className="bg-input border-border"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={venueInfo.email}
//                   onChange={(e) => setVenueInfo((prev) => ({ ...prev, email: e.target.value }))}
//                   className="bg-input border-border"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   value={venueInfo.description}
//                   onChange={(e) => setVenueInfo((prev) => ({ ...prev, description: e.target.value }))}
//                   className="bg-input border-border"
//                   rows={3}
//                 />
//               </div>

//               <Button onClick={handleSaveVenueInfo} className="cinema-glow">
//                 Save Venue Information
//               </Button>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="hours">
//           <Card className="bg-card border-border">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Clock className="h-5 w-5" />
//                 Operating Hours
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {Object.entries(operatingHours).map(([day, hours]) => (
//                 <div key={day} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
//                   <div className="w-24 font-medium capitalize">{day}</div>
//                   <div className="flex items-center gap-2">
//                     <Switch
//                       checked={!hours.closed}
//                       onCheckedChange={(checked) =>
//                         setOperatingHours((prev) => ({
//                           ...prev,
//                           [day]: { ...prev[day as keyof typeof prev], closed: !checked },
//                         }))
//                       }
//                     />
//                     <span className="text-sm text-muted-foreground">Open</span>
//                   </div>
//                   {!hours.closed && (
//                     <>
//                       <Input
//                         type="time"
//                         value={hours.open}
//                         onChange={(e) =>
//                           setOperatingHours((prev) => ({
//                             ...prev,
//                             [day]: { ...prev[day as keyof typeof prev], open: e.target.value },
//                           }))
//                         }
//                         className="w-32 bg-input border-border"
//                       />
//                       <span className="text-muted-foreground">to</span>
//                       <Input
//                         type="time"
//                         value={hours.close}
//                         onChange={(e) =>
//                           setOperatingHours((prev) => ({
//                             ...prev,
//                             [day]: { ...prev[day as keyof typeof prev], close: e.target.value },
//                           }))
//                         }
//                         className="w-32 bg-input border-border"
//                       />
//                     </>
//                   )}
//                   {hours.closed && <span className="text-muted-foreground">Closed</span>}
//                 </div>
//               ))}
//               <Button onClick={handleSaveOperatingHours} className="cinema-glow">
//                 Save Operating Hours
//               </Button>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="pricing">
//           <Card className="bg-card border-border">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <DollarSign className="h-5 w-5" />
//                 Pricing Configuration
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <h4 className="font-medium">Weekday Pricing</h4>
//                   <div className="space-y-3">
//                     <div className="space-y-2">
//                       <Label htmlFor="regularWeekday">Regular Seats ($)</Label>
//                       <Input
//                         id="regularWeekday"
//                         type="number"
//                         step="0.01"
//                         value={pricing.regularWeekday}
//                         onChange={(e) =>
//                           setPricing((prev) => ({ ...prev, regularWeekday: Number.parseFloat(e.target.value) }))
//                         }
//                         className="bg-input border-border"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="premiumWeekday">Premium Seats ($)</Label>
//                       <Input
//                         id="premiumWeekday"
//                         type="number"
//                         step="0.01"
//                         value={pricing.premiumWeekday}
//                         onChange={(e) =>
//                           setPricing((prev) => ({ ...prev, premiumWeekday: Number.parseFloat(e.target.value) }))
//                         }
//                         className="bg-input border-border"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   <h4 className="font-medium">Weekend Pricing</h4>
//                   <div className="space-y-3">
//                     <div className="space-y-2">
//                       <Label htmlFor="regularWeekend">Regular Seats ($)</Label>
//                       <Input
//                         id="regularWeekend"
//                         type="number"
//                         step="0.01"
//                         value={pricing.regularWeekend}
//                         onChange={(e) =>
//                           setPricing((prev) => ({ ...prev, regularWeekend: Number.parseFloat(e.target.value) }))
//                         }
//                         className="bg-input border-border"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="premiumWeekend">Premium Seats ($)</Label>
//                       <Input
//                         id="premiumWeekend"
//                         type="number"
//                         step="0.01"
//                         value={pricing.premiumWeekend}
//                         onChange={(e) =>
//                           setPricing((prev) => ({ ...prev, premiumWeekend: Number.parseFloat(e.target.value) }))
//                         }
//                         className="bg-input border-border"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <h4 className="font-medium">Discounts (%)</h4>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="matineeDiscount">Matinee Discount</Label>
//                     <Input
//                       id="matineeDiscount"
//                       type="number"
//                       value={pricing.matineeDiscount}
//                       onChange={(e) =>
//                         setPricing((prev) => ({ ...prev, matineeDiscount: Number.parseInt(e.target.value) }))
//                       }
//                       className="bg-input border-border"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="seniorDiscount">Senior Discount</Label>
//                     <Input
//                       id="seniorDiscount"
//                       type="number"
//                       value={pricing.seniorDiscount}
//                       onChange={(e) =>
//                         setPricing((prev) => ({ ...prev, seniorDiscount: Number.parseInt(e.target.value) }))
//                       }
//                       className="bg-input border-border"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="studentDiscount">Student Discount</Label>
//                     <Input
//                       id="studentDiscount"
//                       type="number"
//                       value={pricing.studentDiscount}
//                       onChange={(e) =>
//                         setPricing((prev) => ({ ...prev, studentDiscount: Number.parseInt(e.target.value) }))
//                       }
//                       className="bg-input border-border"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <Button onClick={handleSavePricing} className="cinema-glow">
//                 Save Pricing Configuration
//               </Button>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="screens">
//           <Card className="bg-card border-border">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Monitor className="h-5 w-5" />
//                 Screen Management
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <SeatMapEditor />
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }
