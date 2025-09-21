'use client';

import { use, useEffect, useRef, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import CustomerLayout from "@/components/layouts/CustomerLayout"
import { Camera, Mail, Phone, MapPin, Save, Edit2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context';

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  address: z.string().min(5, "Address is required"),
  emergencyContact: z.string(),
  allergies: z.string(),
})

type ImageUploadProps = {
  onImageChange: (url: string) => void;
  currentImage?: string;
};

const ImageUpload = ({ onImageChange, currentImage }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onImageChange(imageUrl);
    }
  };

  return (
    <div className="relative">
      <Input 
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <Button 
        size="icon" 
        variant="outline" 
        className="absolute bottom-0 right-0 rounded-full"
        onClick={() => inputRef.current?.click()}
      >
        <Camera className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState("https://github.com/shadcn.png");
  const name=user?.displayName || "";
 
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: name,
      email: user?.email || "",
      phone: "+1 234 567 8900",
      address: "123 Main St, New York, NY",
      emergencyContact: "+1 234 567 8901",
      allergies: "None",
    },
  })
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.displayName || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
      });
    }
  }, [user, form]);

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    console.log(data)
    setIsEditing(false)
  }

  return (
    <CustomerLayout>
      <div className="container mx-auto py-8 space-y-8">
        {/* Profile Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImage} />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <ImageUpload 
                currentImage={profileImage}
                onImageChange={setProfileImage}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.displayName || "Unknown User"}</h1>
             <p className="text-gray-500">Member since {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
              }) : 'Unknown'}</p>
              <div className="flex space-x-2 mt-2">
                <Badge variant="outline">5 Sessions</Badge>
                <Badge variant="outline">3 Artists</Badge>
              </div>
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Manage your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName"
                      disabled={!isEditing}
                      {...form.register("fullName")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      disabled={!isEditing}
                      {...form.register("email")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      disabled={!isEditing}
                      {...form.register("phone")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address"
                      disabled={!isEditing}
                      {...form.register("address")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input 
                      id="emergencyContact"
                      disabled={!isEditing}
                      {...form.register("emergencyContact")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies/Medical Conditions</Label>
                    <Input 
                      id="allergies"
                      disabled={!isEditing}
                      {...form.register("allergies")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Tattoo Preferences</CardTitle>
                <CardDescription>
                  Your preferred styles and artists
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Favorite Styles</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Traditional</Badge>
                      <Badge>Japanese</Badge>
                      <Badge>Minimalist</Badge>
                      <Badge variant="outline">+ Add Style</Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Favorite Artists</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Artist Cards would go here */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Add notification settings, privacy settings, etc. */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  );
}