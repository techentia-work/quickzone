"use client";

import React, { useEffect, useState } from "react";
import { Loader2, User, Bell, Mail, Edit2, LogOut, Check, X } from "lucide-react";
import type { UserProfileType } from "@/lib/types/user/user.types";
import { useAuth, useUserProfile } from "@/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Button,
} from "@/components/ui";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/consts";

type FormState = {
  firstName: string;
  lastName: string;
  walletAddress: string;
  preferences: {
    email: boolean;
    push: boolean;
  };
};

export default function ProfilePage() {
  const { profile, isLoading, updateProfile, isUpdating } = useUserProfile();
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    walletAddress: "",
    preferences: { email: false, push: false },
  });

  const router = useRouter();

  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      walletAddress: profile.walletAddress ?? "",
      preferences: {
        email: !!profile.metadata?.preferences?.notifications?.email,
        push: !!profile.metadata?.preferences?.notifications?.push,
      },
    });
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (key: "email" | "push") => {
    setForm((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: !prev.preferences[key] },
    }));
  };

  const handleSave = async () => {
    if (!profile) return;

    const payload: Partial<UserProfileType> = {
      firstName: form.firstName,
      lastName: form.lastName,
      walletAddress: form.walletAddress,
      metadata: {
        ...profile.metadata,
        preferences: {
          notifications: {
            email: form.preferences.email,
            push: form.preferences.push,
          },
        },
      },
    };

    await updateProfile(payload);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      walletAddress: profile.walletAddress ?? "",
      preferences: {
        email: !!profile.metadata?.preferences?.notifications?.email,
        push: !!profile.metadata?.preferences?.notifications?.push,
      },
    });
    setIsEditing(false);
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-green-600" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Profile Data</h3>
            <p className="text-gray-600">Unable to load your profile information.</p>
          </div>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 md:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold text-white">
                    User Profile
                  </CardTitle>
                  <CardDescription className="text-green-50 mt-1 text-base">
                    Manage your personal information and preferences
                  </CardDescription>
                </div>
              </div>

              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-green-600 hover:bg-green-50 rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30 rounded-xl px-5 py-3 font-semibold"
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="bg-white text-green-600 hover:bg-green-50 rounded-xl px-5 py-3 font-semibold shadow-lg"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>

          <CardContent className="space-y-8 p-6 md:p-8">
            <section className="group">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
              </div>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      First Name
                    </label>
                    <Input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter first name"
                      className={`h-12 text-base border-2 rounded-xl transition-all ${
                        isEditing 
                          ? "border-green-200 focus:border-green-500 focus:ring-green-500" 
                          : "bg-white border-gray-200"
                      }`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Last Name
                    </label>
                    <Input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter last name"
                      className={`h-12 text-base border-2 rounded-xl transition-all ${
                        isEditing 
                          ? "border-green-200 focus:border-green-500 focus:ring-green-500" 
                          : "bg-white border-gray-200"
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 px-4 h-12 bg-gradient-to-r from-gray-50 to-green-50 border-2 border-gray-200 rounded-xl">
                    <Mail className="w-5 h-5 text-green-600" />
                    <span className="text-base text-gray-700 font-medium">{profile.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200"></div>

            <section className="group">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Bell className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Notification Preferences</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-green-50 border-2 border-gray-200 rounded-xl hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <span className="text-gray-900 font-semibold block">Email Notifications</span>
                      <span className="text-xs text-gray-500">Receive updates via email</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!isEditing}
                    onClick={() => isEditing && handleToggle("email")}
                    className={`relative w-14 h-7 rounded-full transition-all ${
                      form.preferences.email 
                        ? "bg-green-600 shadow-lg shadow-green-200" 
                        : "bg-gray-300"
                    } ${
                      isEditing
                        ? "cursor-pointer hover:shadow-lg"
                        : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        form.preferences.email ? "translate-x-7" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-green-50 border-2 border-gray-200 rounded-xl hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Bell className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <span className="text-gray-900 font-semibold block">Push Notifications</span>
                      <span className="text-xs text-gray-500">Receive push alerts</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!isEditing}
                    onClick={() => isEditing && handleToggle("push")}
                    className={`relative w-14 h-7 rounded-full transition-all ${
                      form.preferences.push 
                        ? "bg-green-600 shadow-lg shadow-green-200" 
                        : "bg-gray-300"
                    } ${
                      isEditing
                        ? "cursor-pointer hover:shadow-lg"
                        : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        form.preferences.push ? "translate-x-7" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200"></div>

            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => { logout(); router.replace(ROUTES.ROOT) }}
                className="flex items-center gap-2 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl px-8 py-3.5 font-semibold transition-all hover:shadow-md w-full sm:w-auto"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}