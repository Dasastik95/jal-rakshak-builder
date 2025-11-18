import { Shield, Clock, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Jal Rakshak</h1>
          <Button variant="ghost" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </header>

      {/* Terms Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <Shield className="w-16 h-16 mx-auto text-primary" />
            <h1 className="text-4xl font-bold">Terms & Conditions</h1>
            <p className="text-muted-foreground text-lg">
              Please read these terms carefully before using Jal Rakshak products
            </p>
          </div>

          <div className="bg-card rounded-lg p-8 space-y-6 shadow-lg">
            {/* Product Usage & Safety */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">Product Usage & Safety</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>• Jal Rakshak is designed exclusively for controlling and protecting single-phase and three-phase motors in domestic and agricultural water pumping applications.</p>
                <p>• Installation must be performed by a qualified technician to ensure proper functioning and safety.</p>
                <p>• The device must be used in accordance with provided instructions. Improper use, tampering, or unauthorized modifications will void the warranty.</p>
                <p>• Do not expose the device to water, extreme heat, or corrosive chemicals.</p>
              </div>
            </section>

            {/* Warranty Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">Warranty Policy</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>• <strong>Warranty Period:</strong> Jal Rakshak comes with a 6-month warranty from the date of purchase.</p>
                <p>• <strong>Coverage:</strong> The warranty covers manufacturing defects and malfunctions under normal use.</p>
                <p>• <strong>Exclusions:</strong></p>
                <ul className="ml-6 space-y-2">
                  <li>- Damage caused by improper installation, misuse, or neglect.</li>
                  <li>- Damage due to power surges, lightning, or electrical faults beyond the device's protection capacity.</li>
                  <li>- Physical damage, tampering, or unauthorized repairs.</li>
                  <li>- Issues arising from using the device with incompatible or faulty motors.</li>
                </ul>
              </div>
            </section>

            {/* Replacement & Repair */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">Replacement & Repair</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>• <strong>DOA (Dead on Arrival):</strong> If the device is found defective within 7 days of purchase, we will replace it free of charge.</p>
                <p>• <strong>Warranty Claims:</strong> For issues arising within the warranty period, customers must contact our support team. We will either repair or replace the device based on the nature of the defect.</p>
                <p>• <strong>Out-of-Warranty Repairs:</strong> Devices beyond the warranty period may be repaired at a nominal service charge, subject to availability of parts.</p>
              </div>
            </section>

            {/* Return & Refund Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">Return & Refund Policy</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>• Returns are accepted only if the device is found defective upon arrival (DOA) and reported within 7 days.</p>
                <p>• Refunds will be processed within 7-10 business days after receiving and verifying the returned product.</p>
                <p>• Products must be returned in original packaging with all accessories and documentation.</p>
                <p>• Non-defective returns or change of mind purchases are not eligible for refunds.</p>
              </div>
            </section>

            {/* Liability Disclaimer */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">Liability Disclaimer</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>• Jal Rakshak is not liable for indirect, incidental, or consequential damages arising from the use or inability to use the product.</p>
                <p>• We are not responsible for motor damage caused by external factors such as electrical faults, voltage fluctuations beyond the device's protection range, or improper wiring.</p>
                <p>• Users are advised to ensure proper electrical infrastructure and professional installation.</p>
              </div>
            </section>

            {/* Customer Support */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Customer Support
              </h2>
              <div className="space-y-4">
                <div className="bg-accent/50 rounded-lg p-4 space-y-3">
                  <p className="font-medium">For assistance, warranty claims, or product queries, contact us:</p>
                  <div className="flex flex-col gap-2">
                    <a href="https://wa.me/917001428212" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                      <Phone className="w-4 h-4" />
                      +91-7001428212 (WhatsApp)
                    </a>
                    <a href="mailto:piyushhh369@gmail.com" className="flex items-center gap-2 text-primary hover:underline">
                      <Mail className="w-4 h-4" />
                      piyushhh369@gmail.com
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Support Hours:</strong> Monday to Saturday, 10:00 AM – 6:00 PM
                  </p>
                </div>
              </div>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">Modifications to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms and conditions at any time. Customers will be notified of significant changes via email or our website.
              </p>
            </section>

            {/* Acceptance */}
            <section className="border-t pt-6">
              <p className="text-muted-foreground">
                By purchasing and using Jal Rakshak, you acknowledge that you have read, understood, and agree to these Terms & Conditions, Warranty Policy, and associated policies.
              </p>
            </section>
          </div>

          <div className="text-center pt-6">
            <Button size="lg" onClick={() => navigate("/")}>
              Return to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20 bg-card">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 Jal Rakshak. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
