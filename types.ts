import React from 'react';

export interface FrameData {
  time: number;
  dataUrl: string; // Base64 image
  index: number;
}

export interface ManualStep {
  title: string;
  description: string;
  frameIndex: number; // Links back to the captured frame
}

export interface GeneratedManual {
  title: string;
  overview: string;
  steps: ManualStep[];
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING_VIDEO = 'PROCESSING_VIDEO', // Extracting frames
  ANALYZING_AI = 'ANALYZING_AI', // Sending to Gemini
  EDITOR = 'EDITOR', // Editing result
  ERROR = 'ERROR'
}

// Defines the props for the reusable Button component
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}