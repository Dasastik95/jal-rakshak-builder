import { Shield, Zap, Settings, Clock, Droplet, Phone, Mail, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingForm } from "@/components/BookingForm";
import { Link, useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Auto Motor Control",
      description: "Automatically switches motor ON/OFF based on water level",
      color: "feature-blue",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Dry-Run Protection",
      description: "Prevents motor damage when water supply is low",
      color: "feature-green",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Overload Safety",
      description: "Protects against electrical overload and short circuits",
      color: "feature-orange",
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Manual Override",
      description: "Switch to manual control when needed",
      color: "feature-purple",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Save Time & Energy",
      description: "Reduce electricity bills and extend motor life",
      color: "feature-teal",
    },
  ];

  const products = [
    {
      name: "Normal Pump",
      price: "₹3,000",
      description: "Ideal for standard domestic water pumps",
      features: ["Auto ON/OFF", "Dry-run protection", "6-month warranty"],
    },
    {
      name: "Submersible Pump",
      price: "₹3,000",
      description: "Designed for submersible pump systems",
      features: ["Deep well compatible", "Advanced protection", "6-month warranty"],
      popular: true,
    },
    {
      name: "Heavy Motor / Air Compressor",
      price: "₹4,000",
      description: "For high-power motors and air compressors",
      features: ["Heavy-duty design", "Enhanced overload protection", "6-month warranty"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Jal Rakshak</h1>
          </div>
          <nav className="hidden md:flex gap-6">
            <button onClick={scrollToBooking} className="hover:text-primary transition-colors">
              Book Now
            </button>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms
            </Link>
            <Link to="/admin" className="hover:text-primary transition-colors">
              Admin
            </Link>
          </nav>
          <Button onClick={scrollToBooking} size="sm" className="md:hidden">
            Book Now
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/5"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
              Motor ka Bodyguard, Paani ka Rakshak
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Jal Rakshak
              <br />
              <span className="text-primary">Smart Motor Protection</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Auto motor control, dry-run & overload protection — save paani, bijli aur motor life.
              <br />
              <span className="text-lg italic mt-2 block">
                "Ek baar lagaiye, tanki ka tension bhool jaaiye!"
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button size="lg" onClick={scrollToBooking} className="text-lg px-8">
                Book Now
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              >
                How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple, smart, and automatic protection</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Droplet className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>1. Sensor Detects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Water level sensor constantly monitors tank levels</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>2. Auto Control</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Device automatically switches motor ON/OFF as needed</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>3. Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Prevents overflow, dry-run, and overload damage</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features - The JAL 5 */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The JAL 5 Benefits</h2>
            <p className="text-xl text-muted-foreground">Five powerful features to protect your motor</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-${feature.color}`} style={{ backgroundColor: `hsl(var(--${feature.color}) / 0.1)` }}>
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Products & Pricing */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Products & Pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the right protection for your pump</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {products.map((product, index) => (
              <Card key={index} className={`relative ${product.popular ? "border-primary border-2" : ""}`}>
                {product.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                  <div className="text-3xl font-bold text-primary mt-4">{product.price}</div>
                  <p className="text-sm text-muted-foreground">One-time purchase</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              <strong>Free installation + demo</strong> • Professional technician support
            </p>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="booking" className="py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Book Your Jal Rakshak</h2>
            <p className="text-xl text-muted-foreground">Fill the form and we'll contact you shortly</p>
          </div>
          <BookingForm />
        </div>
      </section>

      {/* Support & Contact */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Customer Support</h2>
            <p className="text-xl text-muted-foreground">We're here to help</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Phone & WhatsApp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <a
                  href="https://wa.me/917001428212"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat on WhatsApp
                  </Button>
                </a>
                <p className="text-center text-sm text-muted-foreground">+91-7001428212</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Email Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <a href="mailto:piyushhh369@gmail.com">
                  <Button variant="outline" className="w-full">
                    Send Email
                  </Button>
                </a>
                <p className="text-center text-sm text-muted-foreground">piyushhh369@gmail.com</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8 p-6 bg-card rounded-lg">
            <Clock className="w-8 h-8 text-primary mx-auto mb-4" />
            <p className="font-medium mb-2">Support Hours</p>
            <p className="text-muted-foreground">Monday to Saturday, 10:00 AM – 6:00 PM</p>
          </div>
        </div>
      </section>

      {/* Sticky WhatsApp Button */}
      <a
        href="https://wa.me/917001428212"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Footer */}
      <footer className="border-t mt-20 bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Droplet className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold">Jal Rakshak</h3>
              </div>
              <p className="text-muted-foreground">
                Motor ka bodyguard, paani ka rakshak. Protecting motors and saving water across India.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <button onClick={scrollToBooking} className="hover:text-primary transition-colors">
                    Book Now
                  </button>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-primary transition-colors">
                    Terms & Warranty
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-primary transition-colors">
                    Admin Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>+91-7001428212</li>
                <li>piyushhh369@gmail.com</li>
                <li>Mon-Sat, 10 AM – 6 PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 Jal Rakshak. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
