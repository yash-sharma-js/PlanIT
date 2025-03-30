
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, QrCode, X } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [userName, setUserName] = useState(user?.userName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleSave = () => {
    // In a real app, this would save to the database
    toast.success("Profile updated successfully");
    setIsEditing(false);
  };

  const openCamera = async () => {
    setCameraError(null);
    try {
      // First, check if media devices are supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media devices API not supported in this browser");
      }
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setIsCameraOpen(true);
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      setCameraError(error.message || "Could not access camera. Please check permissions.");
      toast.error("Camera access failed: " + (error.message || "Check permissions"));
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
          // Convert canvas to data URL and set as avatar
          const dataUrl = canvas.toDataURL('image/png');
          setAvatarUrl(dataUrl);
          
          // Close camera
          closeCamera();
          
          toast.success("Photo captured successfully");
        } catch (e) {
          console.error("Error capturing photo:", e);
          toast.error("Failed to capture photo");
        }
      } else {
        toast.error("Video stream not ready. Please try again.");
      }
    }
  };

  const closeCamera = () => {
    // Stop all video tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsCameraOpen(false);
  };

  // Ensure we clean up if the component unmounts while camera is open
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="container max-w-2xl mx-auto py-6 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} alt={user?.name || ""} />
              <AvatarFallback className="text-xl">{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
            </Avatar>
            
            <Button 
              size="icon"
              variant="outline"
              className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 bg-background border-background shadow"
              onClick={openCamera}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          
          <div>
            <CardTitle className="text-2xl">{user?.name}</CardTitle>
            <CardDescription>@{user?.userName || ""}</CardDescription>
            <CardDescription>{user?.email}</CardDescription>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setIsQrDialogOpen(true)}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Your QR Code
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userName">Username</Label>
              <Input 
                id="userName" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={!isEditing || true} // Email always disabled for this demo
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => logout()}>Sign Out</Button>
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </>
          )}
        </CardFooter>
      </Card>

      {/* Camera Dialog */}
      <Dialog open={isCameraOpen} onOpenChange={(open) => !open && closeCamera()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Take a profile picture</DialogTitle>
            <DialogDescription>
              Position your face in the center of the frame
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative overflow-hidden rounded-lg border">
              {cameraError ? (
                <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
                  <p className="font-medium">Camera access error</p>
                  <p className="text-sm">{cameraError}</p>
                </div>
              ) : (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="h-auto w-full max-h-[300px] object-cover"
                />
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex space-x-2">
              <Button variant="outline" onClick={closeCamera}>
                Cancel
              </Button>
              <Button onClick={capturePhoto} disabled={!!cameraError}>
                Capture Photo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your QR Code</DialogTitle>
            <DialogDescription>
              Share this QR code to quickly connect with others
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG 
                value={`planit://user/${user?.userName || user?.id}`} 
                size={200} 
                level="H"
                includeMargin
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Scan this QR code to view @{user?.userName}'s profile
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
