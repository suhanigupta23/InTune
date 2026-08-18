import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Clock, Send, Home, MessageCircle, Heart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent successfully! 📩",
      description: "We'll get back to you within 24 hours. Thank you for contacting InTune!",
    });
    setFormData({
      name: "",
      email: "",
      subject: "",
      category: "",
      message: ""
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: "hello@intune-app.com",
      description: "We respond within 24 hours"
    },
    {
      icon: Phone,
      title: "Call Us",
      content: "+91 98765 43210",
      description: "Mon-Fri, 9 AM - 6 PM IST"
    },
    {
      icon: MapPin,
      title: "Location",
      content: "Bangalore, Karnataka",
      description: "Building the future of roommate matching"
    },
    {
      icon: Clock,
      title: "Support Hours",
      content: "24/7 Online",
      description: "AI chatbot available round the clock"
    }
  ];

  const faqItems = [
    {
      question: "How does voice matching work?",
      answer: "Our AI analyzes your voice patterns, tone, and responses to emotional questions to understand your personality and match you with compatible roommates."
    },
    {
      question: "Is my identity really anonymous?",
      answer: "Yes! You receive a unique anonymous ID (like Anon_2847) and your real identity is only revealed after mutual consent from both parties."
    },
    {
      question: "How accurate is the matching system?",
      answer: "Our AI-powered matching system has a 97% accuracy rate based on user feedback and successful long-term roommate relationships."
    },
    {
      question: "What if I have conflicts with my roommate?",
      answer: "InTune includes GuideBot, an AI-powered conflict resolution system with templates and advice for common roommate situations."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      {/* Hero Section */}
<section
  className="py-24 bg-cover bg-center relative"
  style={{
    backgroundImage:
      "url('https://i.pinimg.com/736x/5e/c2/61/5ec261f6bd99759d307efb8640c12658.jpg')",
  }}
>
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0" />

  <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
    <Link
      to="/"
      className="inline-flex items-center text-white hover:text-gray-200 mb-6 transition-smooth"
    >
      <Home className="w-4 h-4 mr-2" />
      Back to Home
    </Link>

    <h1 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg">
      Get in Touch
    </h1>
    <p className="text-xl mb-8 leading-relaxed drop-shadow-md">
      Have questions about InTune? Need help with your account? <br />
      We're here to help you find your perfect roommate match.
    </p>
  </div>
</section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <Card key={index} className="bg-card-gradient border-border/50 hover-lift text-center">
                  <CardHeader>
                    <div className="w-12 h-12 mx-auto mb-4 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-primary">
                      {info.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium text-foreground mb-2">{info.content}</p>
                    <p className="text-sm text-muted-foreground">{info.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Contact Form & FAQ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-card-gradient border-border/50 shadow-warm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                  <MessageCircle className="w-6 h-6" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="account">Account Issues</SelectItem>
                        <SelectItem value="matching">Matching Problems</SelectItem>
                        <SelectItem value="safety">Safety Concerns</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your inquiry"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    <Send className="mr-2 w-4 h-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                  <Heart className="w-6 h-6" />
                  Frequently Asked Questions
                </h3>
              </div>
              
              <div className="space-y-4">
                {faqItems.map((faq, index) => (
                  <Card key={index} className="bg-card-gradient border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-primary">
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-accent-gradient border-border/50">
                <CardContent className="pt-6 text-center">
                  <h4 className="font-semibold text-accent-foreground mb-2">
                    Need immediate help?
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Try our AI-powered GuideBot for instant answers to common questions.
                  </p>
                  <Button variant="hero" size="sm">
                    Chat with GuideBot
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;