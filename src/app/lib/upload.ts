// lib/upload.ts
import { genUploader } from "uploadthing/client";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// this will give you a typed `uploadFiles` function
export const { uploadFiles } = genUploader<OurFileRouter>();
