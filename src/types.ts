/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = "ADMIN",
  ORGANIZER = "ORGANIZER",
  EDITOR = "EDITOR"
}

export interface RSVP {
  id: string;
  createdAt: string;
  name: string;
  attendance: boolean;
  guests: number;
  wish?: string;
  phone?: string;
}

export type TemplateCategory =
  | "Elegan"
  | "Islamik"
  | "Korporat"
  | "Minimalis"
  | "Floral"
  | "Gold Luxury"
  | "Batik"
  | "Melayu Tradisional"
  | "Modern Glass"
  | "Premium Dark"
  | "Royal"
  | "Soft Pastel";

export interface CardTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  frameStyle: "none" | "classic" | "floral" | "royal" | "modern" | "glass";
  borderStyle: "none" | "solid" | "double" | "dashed" | "ornate" | "classic";
  particleType: "none" | "snow" | "flower" | "sparkle" | "firefly" | "confetti" | "golden" | "bubble";
  bgPattern?: string;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number; // in px
  color: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  shadow: boolean;
  outline: boolean;
  glow: boolean;
  gradient: boolean;
  text3d: boolean;
  curve: boolean;
  opacity: number; // 0 to 1
  letterSpacing: number; // in px
  lineHeight: number; // multiplier
  rotate: number; // degrees
  scale: number; // multiplier
  mirror: boolean;
}

export interface CardContent {
  id: string;
  title: string;
  inviteeName: string;
  designation: string;
  agency: string;
  dateStr: string;
  dayStr: string;
  timeStr: string;
  venue: string;
  dressCode: string;
  qrType: "whatsapp" | "maps" | "website" | "rsvp" | "calendar";
  qrValue: string;
  message: string;
  prayer: string;
  logoUrl?: string;
  imageUrl?: string;
  bgMusicUrl?: string;
  bgMusicName?: string;
  signatureUrl?: string;
  gpsCoordinates?: string;
  mapAddress?: string;
  activePage: "front" | "content" | "back";
  
  // Custom design overwrites
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  frameStyle: string;
  borderStyle: string;
  particleType: string;
  
  // Position offsets for editor items
  positions: {
    [key: string]: { x: number; y: number };
  };
  
  // Custom styles for text components
  textStyles: {
    [key: string]: TextStyle;
  };
}
