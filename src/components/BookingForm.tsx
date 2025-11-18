import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Phone } from "lucide-react";

const bookingSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  phone: z.string().trim().regex(/^[0-9]{10,13}$/, "Invalid phone number (10-13 digits)"),
  address: z.string().trim().min(1, "Address is required").max(500, "Address too long"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  pumpType: z.enum(["normal", "submersible", "air_compressor"]),
  referrer: z.string().max(100, "Referrer name too long").optional(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

export const BookingForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    quantity: 1,
    pumpType: "normal",
    referrer: "",
    termsAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const { toast } = useToast();

  const generateOrderId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `JR-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = bookingSchema.parse(formData);
      const newOrderId = generateOrderId();

      const { error } = await supabase.from("bookings").insert({
        order_id: newOrderId,
        full_name: validated.fullName,
        phone: validated.phone,
        address: validated.address,
        quantity: validated.quantity,
        pump_type: validated.pumpType,
        referrer: validated.referrer || null,
        terms_accepted: validated.termsAccepted,
      });

      if (error) throw error;

      setOrderId(newOrderId);
      setShowSuccess(true);
      setFormData({
        fullName: "",
        phone: "",
        address: "",
        quantity: 1,
        pumpType: "normal",
        referrer: "",
        termsAccepted: false,
      });

      toast({
        title: "Booking Confirmed!",
        description: `Your order ID is ${newOrderId}`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit booking. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const pumpTypeLabels = {
    normal: "Normal Pump",
    submersible: "Submersible Pump",
    air_compressor: "Air Compressor Pump (Heavy Motor)",
  };

  const whatsappMessage = orderId
    ? `Hello Jal Rakshak, I have placed an order. Order ID: ${orderId}. Name: ${formData.fullName}. Pump type: ${pumpTypeLabels[formData.pumpType as keyof typeof pumpTypeLabels]}. Qty: ${formData.quantity}.`
    : "";

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-lg shadow-lg">
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone / WhatsApp Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="10-13 digits"
            required
          />
        </div>

        <div>
          <Label htmlFor="address">Address *</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Complete installation address"
            required
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
            required
          />
        </div>

        <div>
          <Label>Type of Pump *</Label>
          <RadioGroup
            value={formData.pumpType}
            onValueChange={(value) => setFormData({ ...formData, pumpType: value })}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="normal" id="normal" />
              <Label htmlFor="normal" className="font-normal cursor-pointer">
                Normal Pump - ₹3,000
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="submersible" id="submersible" />
              <Label htmlFor="submersible" className="font-normal cursor-pointer">
                Submersible Pump - ₹3,000
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="air_compressor" id="air_compressor" />
              <Label htmlFor="air_compressor" className="font-normal cursor-pointer">
                Heavy Motor / Air Compressor - ₹4,000
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="referrer">Who referred you to us? (Optional)</Label>
          <Input
            id="referrer"
            value={formData.referrer}
            onChange={(e) => setFormData({ ...formData, referrer: e.target.value })}
            placeholder="Salesperson or referrer name"
          />
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={formData.termsAccepted}
            onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked === true })}
          />
          <Label htmlFor="terms" className="font-normal cursor-pointer leading-relaxed">
            I accept the{" "}
            <a href="/terms" target="_blank" className="text-primary hover:underline font-medium">
              Terms & Conditions
            </a>
            , including warranty and return policies *
          </Label>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Confirm Booking"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Free installation + demo included • 6-month warranty
        </p>
      </form>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-center space-y-4">
              <p className="text-lg">
                Your Order ID: <span className="font-mono font-bold text-primary">{orderId}</span>
              </p>
              <p>Thank you! We will contact you on WhatsApp shortly to confirm installation details.</p>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Button asChild className="w-full" size="lg">
              <a
                href={`https://wa.me/917001428212?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone className="w-4 h-4 mr-2" />
                Confirm on WhatsApp
              </a>
            </Button>
            <Button variant="outline" onClick={() => setShowSuccess(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
