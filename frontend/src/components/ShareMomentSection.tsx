import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, Upload, Heart, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';

const ShareMomentSection = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [story, setStory] = useState("");
  const [showSubmission, setShowSubmission] = useState(false);
  const { toast } = useToast();

  // Helper function to convert data URL to File
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCapturedImage(null); // Clear any captured image
      setShowConsentDialog(true);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        setCapturedImage(image.dataUrl);
        // Convert to File object for consistency with upload flow
        const file = dataURLtoFile(image.dataUrl, `camera-${Date.now()}.jpg`);
        setSelectedFile(file);
        setShowConsentDialog(true);
        
        toast({
          title: "Photo captured!",
          description: "Photo taken successfully from camera.",
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      toast({
        title: "Camera Error", 
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const handleConsentSubmit = () => {
    if (consentGiven) {
      setShowConsentDialog(false);
      setShowStoryForm(true);
      toast({
        title: "Photo selected!",
        description: "Please share your story to complete the submission.",
      });
    } else {
      toast({
        title: "Consent required",
        description: "Please consent to sharing your photo to continue.",
        variant: "destructive",
      });
    }
  };

  const handleStorySubmit = () => {
    if (story.trim()) {
      setShowStoryForm(false);
      setShowSubmission(true);
      toast({
        title: "Story submitted!",
        description: "Thank you for sharing your happy moment with our community!",
      });
    } else {
      toast({
        title: "Story required",
        description: "Please share your story to complete the submission.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setCapturedImage(null);
    setConsentGiven(false);
    setShowStoryForm(false);
    setShowSubmission(false);
    setStory("");
  };

  // Get image source for display
  const getImageSrc = () => {
    if (capturedImage) return capturedImage;
    if (selectedFile) return URL.createObjectURL(selectedFile);
    return null;
  };

  return (
    <section className="py-20 bg-warm-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Heart className="w-12 h-12 text-warm-brown mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-warm-brown mb-4">
            Share Your Happy Moment!
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Found your perfect roommate? Share your joy with our community and 
            inspire others to find their ideal living companion.
          </p>
        </div>

        {showSubmission ? (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center border-green-200 bg-green-50">
              <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-800 mb-4">Submission Complete!</h3>
              <div className="mb-6">
                {(selectedFile || capturedImage) && (
                  <img 
                    src={getImageSrc()!} 
                    alt="Submitted photo"
                    className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                  />
                )}
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-gray-700 italic">"{story}"</p>
                </div>
              </div>
              <p className="text-green-700 mb-6">
                Your story has been submitted for review and will appear in our gallery soon!
              </p>
              <Button onClick={resetForm} variant="outline">
                Share Another Story
              </Button>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 justify-center max-w-4xl mx-auto">
            <Card className="flex-1 p-8 text-center border-2 border-dashed border-warm-brown hover:bg-warm-beige/50 transition-colors cursor-pointer group">
              <div onClick={handleTakePhoto}>
                <Camera className="w-16 h-16 text-warm-brown mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-warm-brown mb-2">Take Photo</h3>
                <p className="text-muted-foreground">Capture the moment now</p>
              </div>
            </Card>

            <Card className="flex-1 p-8 text-center border-2 border-dashed border-warm-brown hover:bg-warm-beige/50 transition-colors cursor-pointer group">
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-16 h-16 text-warm-brown mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-warm-brown mb-2">Upload Photos</h3>
                <p className="text-muted-foreground">From your gallery</p>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </Card>
          </div>
        )}

        {/* Consent Dialog */}
        <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Photo Usage Consent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {(selectedFile || capturedImage) && (
                <div className="text-center">
                  <img 
                    src={getImageSrc()!} 
                    alt="Selected photo"
                    className="w-32 h-32 object-cover rounded-lg mx-auto border-2 border-warm-brown"
                  />
                  <p className="text-sm text-muted-foreground mt-2">Selected photo</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Do you consent to having your image used in our community portal to inspire other women finding roommates?
              </p>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="consent" 
                  checked={consentGiven}
                  onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
                />
                <Label htmlFor="consent" className="text-sm">
                  Yes, I consent to sharing my photo on the portal
                </Label>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConsentDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConsentSubmit}
                  className="flex-1 bg-warm-brown hover:bg-warm-brown/90 text-[#5f4339]"
                >
                  Continue
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Story Form Dialog */}
        <Dialog open={showStoryForm} onOpenChange={setShowStoryForm}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Share Your Story</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {(selectedFile || capturedImage) && (
                <div className="text-center">
                  <img 
                    src={getImageSrc()!} 
                    alt="Your photo"
                    className="w-24 h-24 object-cover rounded-lg mx-auto border-2 border-warm-brown"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="story">Tell us about your roommate match experience</Label>
                <Textarea 
                  id="story"
                  placeholder="Share your happy moment and what made your roommate match perfect..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowStoryForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleStorySubmit}
                  className="flex-1 bg-warm-brown hover:bg-warm-brown/90 text-[#5f4339]"
                >
                  Submit Story
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default ShareMomentSection;