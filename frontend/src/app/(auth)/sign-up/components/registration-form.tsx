"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, File, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

// --- Schemas ---
const partnerInfoSchema = z.object({
  ownerName: z.string().min(1, "Owner Name is required"),
  companyName: z.string().min(1, "Company Name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone Number is required"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Mock schema for documents - in a real app, this would handle file objects
const documentSchema = z.object({
  nid: z.any().refine((file) => !!file, "NID Document is required"),
  tradeLicense: z.any().refine((file) => !!file, "Trade License is required"),
  caabCertificate: z.any().optional(),
});

type PartnerInfo = z.infer<typeof partnerInfoSchema>;

export function RegistrationForm() {
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const router = useRouter();

  // We use one form for the first step and custom state for documents to simplify the example
  const partnerForm = useForm<PartnerInfo>({
    resolver: zodResolver(partnerInfoSchema),
    mode: "onTouched", // Validates on blur for a more premium feel
    defaultValues: {
      ownerName: "",
      companyName: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      city: "",
      country: "Bangladesh",
    }
  });

  const [documents, setDocuments] = React.useState<Record<string, File | null>>({
    nid: null,
    tradeLicense: null,
    caabCertificate: null,
  });

  const [docErrors, setDocErrors] = React.useState<Record<string, string | null>>({ nid: null, tradeLicense: null, caabCertificate: null });

  const onStep1Submit = () => {
    setStep(2);
  };

  const onNextStep2 = () => {
    const nidValid = !!documents.nid;
    const tradeValid = !!documents.tradeLicense;
    
    setDocErrors((prev) => ({
      ...prev,
      nid: nidValid ? null : "NID document is required to proceed",
      tradeLicense: tradeValid ? null : "Trade License is required to proceed"
    }));
    
    if (!nidValid || !tradeValid) {
      return;
    }
    setStep(3);
  };

  const onSubmitFinal = async () => {
    setIsLoading(true);
    // Simulate API submission
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    router.push("/registration-submitted");
  };

  const handleFileUpload = (type: string, file: File | null) => {
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      // Some OS might provide empty types for certain extensions, or we can just check the extension as a fallback
      const extension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
      
      if (!allowedTypes.includes(file.type) && (!extension || !allowedExtensions.includes(extension))) {
        setDocErrors(prev => ({ ...prev, [type]: "Invalid format. Please upload a PDF, JPG, or PNG file." }));
        // Clear the invalid file
        setDocuments((prev) => ({ ...prev, [type]: null }));
        return;
      }
    }
    
    setDocuments((prev) => ({ ...prev, [type]: file }));
    setDocErrors(prev => ({ ...prev, [type]: null }));
  };

  return (
    <div className="flex flex-col gap-10 w-full">
      {/* Premium Stepper */}
      <div className="flex items-center justify-center mb-2 px-4 md:px-12 w-full max-w-2xl mx-auto">
        <div className={`flex flex-col items-center gap-2 relative z-10 transition-colors duration-300 ${step >= 1 ? 'text-aci-green-700' : 'text-slate-400'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-500 ${step >= 1 ? 'bg-gradient-to-br from-aci-green-500 to-aci-green-700 text-white shadow-aci-green-500/30' : 'bg-white border border-slate-200 text-slate-400'}`}>
            {step > 1 ? <Check size={20} strokeWidth={3} /> : "1"}
          </div>
          <span className="text-sm font-semibold tracking-wide hidden md:block">Profile</span>
        </div>
        <div className={`flex-1 h-[2px] mx-2 md:mx-4 transition-all duration-500 ${step >= 2 ? 'bg-aci-green-500' : 'bg-slate-200'}`}></div>
        <div className={`flex flex-col items-center gap-2 relative z-10 transition-colors duration-300 ${step >= 2 ? 'text-aci-green-700' : 'text-slate-400'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-500 ${step >= 2 ? 'bg-gradient-to-br from-aci-green-500 to-aci-green-700 text-white shadow-aci-green-500/30' : 'bg-white border border-slate-200 text-slate-400'}`}>
            {step > 2 ? <Check size={20} strokeWidth={3} /> : "2"}
          </div>
          <span className="text-sm font-semibold tracking-wide hidden md:block">Documents</span>
        </div>
        <div className={`flex-1 h-[2px] mx-2 md:mx-4 transition-all duration-500 ${step >= 3 ? 'bg-aci-green-500' : 'bg-slate-200'}`}></div>
        <div className={`flex flex-col items-center gap-2 relative z-10 transition-colors duration-300 ${step >= 3 ? 'text-aci-green-700' : 'text-slate-400'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-500 ${step >= 3 ? 'bg-gradient-to-br from-aci-green-500 to-aci-green-700 text-white shadow-aci-green-500/30' : 'bg-white border border-slate-200 text-slate-400'}`}>
            3
          </div>
          <span className="text-sm font-semibold tracking-wide hidden md:block">Review</span>
        </div>
      </div>

      <div className="bg-white/40 border border-white/60 rounded-3xl p-6 md:p-8 shadow-sm">
        {/* Step 1: Partner Information */}
        {step === 1 && (
          <form onSubmit={partnerForm.handleSubmit(onStep1Submit)} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ownerName" className="text-slate-700 font-semibold ml-1">Owner Full Name <span className="text-red-500">*</span></Label>
                <Input id="ownerName" {...partnerForm.register("ownerName")} aria-invalid={!!partnerForm.formState.errors.ownerName} />
                {partnerForm.formState.errors.ownerName && <span className="text-xs text-red-500 ml-1 font-medium">{partnerForm.formState.errors.ownerName.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="companyName" className="text-slate-700 font-semibold ml-1">Company Name <span className="text-red-500">*</span></Label>
                <Input id="companyName" {...partnerForm.register("companyName")} aria-invalid={!!partnerForm.formState.errors.companyName} />
                {partnerForm.formState.errors.companyName && <span className="text-xs text-red-500 ml-1 font-medium">{partnerForm.formState.errors.companyName.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold ml-1">Partner Email <span className="text-red-500">*</span></Label>
                <Input id="email" type="email" {...partnerForm.register("email")} aria-invalid={!!partnerForm.formState.errors.email} />
                {partnerForm.formState.errors.email && <span className="text-xs text-red-500 ml-1 font-medium">{partnerForm.formState.errors.email.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-slate-700 font-semibold ml-1">Password <span className="text-red-500">*</span></Label>
                <Input id="password" type="password" {...partnerForm.register("password")} aria-invalid={!!partnerForm.formState.errors.password} />
                {partnerForm.formState.errors.password && <span className="text-xs text-red-500 ml-1 font-medium">{partnerForm.formState.errors.password.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone" className="text-slate-700 font-semibold ml-1">Phone Number <span className="text-red-500">*</span></Label>
                <Input id="phone" {...partnerForm.register("phone")} aria-invalid={!!partnerForm.formState.errors.phone} />
                {partnerForm.formState.errors.phone && <span className="text-xs text-red-500 ml-1 font-medium">{partnerForm.formState.errors.phone.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="country" className="text-slate-700 font-semibold ml-1">Country/Region <span className="text-red-500">*</span></Label>
                <Input id="country" {...partnerForm.register("country")} aria-invalid={!!partnerForm.formState.errors.country} />
                {partnerForm.formState.errors.country && <span className="text-xs text-red-500 ml-1 font-medium">{partnerForm.formState.errors.country.message}</span>}
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="address" className="text-slate-700 font-semibold ml-1">Address <span className="text-red-500">*</span></Label>
                <Input id="address" {...partnerForm.register("address")} aria-invalid={!!partnerForm.formState.errors.address} />
                {partnerForm.formState.errors.address && <span className="text-xs text-red-500 ml-1 font-medium">{partnerForm.formState.errors.address.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="city" className="text-slate-700 font-semibold ml-1">City/Area <span className="text-red-500">*</span></Label>
                <Input id="city" {...partnerForm.register("city")} aria-invalid={!!partnerForm.formState.errors.city} />
                {partnerForm.formState.errors.city && <span className="text-xs text-red-500 ml-1 font-medium">{partnerForm.formState.errors.city.message}</span>}
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button type="submit" className="bg-gradient-to-r from-aci-green-500 to-aci-green-700 hover:from-aci-green-700 hover:to-aci-green-900 text-white w-full md:w-auto h-12 px-8 rounded-xl shadow-lg shadow-aci-green-500/20 font-semibold tracking-wide transition-all duration-300">
                Continue to Documents
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* NID Upload */}
            <div className={`relative overflow-hidden p-8 rounded-2xl border-2 border-dashed transition-all duration-300 group ${docErrors.nid ? 'border-red-400 bg-red-50/50' : documents.nid ? 'border-aci-green-500 bg-aci-green-50/50' : 'border-slate-300 bg-white/50 hover:border-aci-green-400 hover:bg-white/80 hover:shadow-lg hover:shadow-aci-green-500/10 hover:-translate-y-1'}`}>
              <Input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => handleFileUpload("nid", e.target.files?.[0] || null)} aria-invalid={!!docErrors.nid} />
              
              <div className="flex flex-col items-center justify-center pointer-events-none text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${documents.nid ? 'bg-aci-green-100 text-aci-green-600 shadow-inner' : 'bg-white shadow-sm text-slate-400 group-hover:bg-aci-green-50 group-hover:text-aci-green-500'}`}>
                  {documents.nid ? <Check size={32} strokeWidth={2.5} className="animate-in zoom-in duration-300" /> : <Upload size={32} className="group-hover:-translate-y-1 group-hover:scale-110 transition-transform duration-300" />}
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">NID (National ID) <span className="text-red-500">*</span></h3>
                <p className="text-sm text-slate-500 mb-4 max-w-xs">Upload a clear scanned copy or photo of the owner's National ID.</p>
                {documents.nid ? (
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-aci-green-200 animate-in fade-in slide-in-from-bottom-2">
                    <File size={16} className="text-aci-green-500" />
                    <span className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{documents.nid.name}</span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-aci-green-600 bg-white shadow-sm border border-slate-100 px-5 py-2 rounded-xl group-hover:bg-aci-green-500 group-hover:text-white transition-colors duration-300">Browse Files</span>
                )}
                {docErrors.nid && <p className="text-xs font-bold text-red-500 mt-4 bg-red-100 px-3 py-1.5 rounded-lg animate-in slide-in-from-top-1">{docErrors.nid}</p>}
              </div>
            </div>

            {/* Trade License Upload */}
            <div className={`relative overflow-hidden p-8 rounded-2xl border-2 border-dashed transition-all duration-300 group ${docErrors.tradeLicense ? 'border-red-400 bg-red-50/50' : documents.tradeLicense ? 'border-aci-green-500 bg-aci-green-50/50' : 'border-slate-300 bg-white/50 hover:border-aci-green-400 hover:bg-white/80 hover:shadow-lg hover:shadow-aci-green-500/10 hover:-translate-y-1'}`}>
              <Input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => handleFileUpload("tradeLicense", e.target.files?.[0] || null)} aria-invalid={!!docErrors.tradeLicense} />
              
              <div className="flex flex-col items-center justify-center pointer-events-none text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${documents.tradeLicense ? 'bg-aci-green-100 text-aci-green-600 shadow-inner' : 'bg-white shadow-sm text-slate-400 group-hover:bg-aci-green-50 group-hover:text-aci-green-500'}`}>
                  {documents.tradeLicense ? <Check size={32} strokeWidth={2.5} className="animate-in zoom-in duration-300" /> : <Upload size={32} className="group-hover:-translate-y-1 group-hover:scale-110 transition-transform duration-300" />}
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">Trade License <span className="text-red-500">*</span></h3>
                <p className="text-sm text-slate-500 mb-4 max-w-xs">Upload a valid, up-to-date trade license for your company.</p>
                {documents.tradeLicense ? (
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-aci-green-200 animate-in fade-in slide-in-from-bottom-2">
                    <File size={16} className="text-aci-green-500" />
                    <span className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{documents.tradeLicense.name}</span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-aci-green-600 bg-white shadow-sm border border-slate-100 px-5 py-2 rounded-xl group-hover:bg-aci-green-500 group-hover:text-white transition-colors duration-300">Browse Files</span>
                )}
                {docErrors.tradeLicense && <p className="text-xs font-bold text-red-500 mt-4 bg-red-100 px-3 py-1.5 rounded-lg animate-in slide-in-from-top-1">{docErrors.tradeLicense}</p>}
              </div>
            </div>

            {/* CAAB Certificate Upload */}
            <div className={`relative overflow-hidden p-8 rounded-2xl border-2 border-dashed transition-all duration-300 group ${docErrors.caabCertificate ? 'border-red-400 bg-red-50/50' : documents.caabCertificate ? 'border-aci-green-500 bg-aci-green-50/50' : 'border-slate-300 bg-white/50 hover:border-aci-green-400 hover:bg-white/80 hover:shadow-lg hover:shadow-aci-green-500/10 hover:-translate-y-1'}`}>
              <Input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => handleFileUpload("caabCertificate", e.target.files?.[0] || null)} aria-invalid={!!docErrors.caabCertificate} />
              
              <div className="flex flex-col items-center justify-center pointer-events-none text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${documents.caabCertificate ? 'bg-aci-green-100 text-aci-green-600 shadow-inner' : 'bg-white shadow-sm text-slate-400 group-hover:bg-aci-green-50 group-hover:text-aci-green-500'}`}>
                  {documents.caabCertificate ? <Check size={32} strokeWidth={2.5} className="animate-in zoom-in duration-300" /> : <Upload size={32} className="group-hover:-translate-y-1 group-hover:scale-110 transition-transform duration-300" />}
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">CAAB Certificate <span className="text-slate-400 font-normal text-sm ml-1">(Optional)</span></h3>
                <p className="text-sm text-slate-500 mb-4 max-w-xs">Upload your Civil Aviation Authority certificate if applicable.</p>
                {documents.caabCertificate ? (
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-aci-green-200 animate-in fade-in slide-in-from-bottom-2">
                    <File size={16} className="text-aci-green-500" />
                    <span className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{documents.caabCertificate.name}</span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-slate-500 bg-white shadow-sm border border-slate-100 px-5 py-2 rounded-xl group-hover:bg-aci-green-50 group-hover:text-aci-green-600 transition-colors duration-300">Browse Files</span>
                )}
                {docErrors.caabCertificate && <p className="text-xs font-bold text-red-500 mt-4 bg-red-100 px-3 py-1.5 rounded-lg animate-in slide-in-from-top-1">{docErrors.caabCertificate}</p>}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-12 px-8 rounded-xl font-semibold border-slate-300 text-slate-700 bg-white/80 hover:bg-white hover:text-slate-900 transition-all">
                Back to Profile
              </Button>
              <Button type="button" onClick={onNextStep2} className="bg-gradient-to-r from-aci-green-500 to-aci-green-700 hover:from-aci-green-700 hover:to-aci-green-900 text-white h-12 px-8 rounded-xl shadow-lg shadow-aci-green-500/20 font-semibold tracking-wide transition-all duration-300">
                Continue to Review
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/70 border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 text-lg border-b border-slate-200/60 pb-3 mb-4">Partner Identity</h3>
                <div className="flex flex-col gap-4 text-sm">
                  <div className="flex flex-col"><span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Owner Name</span> <span className="font-semibold text-slate-800">{partnerForm.getValues("ownerName")}</span></div>
                  <div className="flex flex-col"><span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Company Name</span> <span className="font-semibold text-slate-800">{partnerForm.getValues("companyName")}</span></div>
                </div>
              </div>
              
              <div className="bg-white/70 border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 text-lg border-b border-slate-200/60 pb-3 mb-4">Contact & Location</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col"><span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Email</span> <span className="font-semibold text-slate-800 break-all">{partnerForm.getValues("email")}</span></div>
                  <div className="flex flex-col"><span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Phone</span> <span className="font-semibold text-slate-800">{partnerForm.getValues("phone")}</span></div>
                  <div className="flex flex-col"><span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Country</span> <span className="font-semibold text-slate-800">{partnerForm.getValues("country")}</span></div>
                  <div className="flex flex-col"><span className="text-slate-500 text-xs uppercase tracking-wider mb-1">City</span> <span className="font-semibold text-slate-800">{partnerForm.getValues("city")}</span></div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-lg border-b border-slate-200/60 pb-3 mb-4">Documents Provided</h3>
              <div className="flex flex-col sm:flex-row gap-6 text-sm">
                <div className="flex items-center gap-3 bg-aci-green-50/50 px-4 py-3 rounded-xl border border-aci-green-100 flex-1"><Check size={20} className="text-aci-green-500 bg-white rounded-full p-0.5 shadow-sm" /> <span className="font-semibold text-slate-700">NID Uploaded</span></div>
                <div className="flex items-center gap-3 bg-aci-green-50/50 px-4 py-3 rounded-xl border border-aci-green-100 flex-1"><Check size={20} className="text-aci-green-500 bg-white rounded-full p-0.5 shadow-sm" /> <span className="font-semibold text-slate-700">Trade License Uploaded</span></div>
                {documents.caabCertificate && <div className="flex items-center gap-3 bg-aci-green-50/50 px-4 py-3 rounded-xl border border-aci-green-100 flex-1"><Check size={20} className="text-aci-green-500 bg-white rounded-full p-0.5 shadow-sm" /> <span className="font-semibold text-slate-700">CAAB Cert. Uploaded</span></div>}
              </div>
            </div>
            
            <div className="bg-white/70 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-lg border-b border-slate-200/60 pb-3 mb-4">Legal Declarations</h3>
              <div className="flex items-start gap-3">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id="terms"
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-aci-green-600 focus:ring-aci-green-500 cursor-pointer"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="terms" className="text-sm font-semibold text-slate-700 cursor-pointer">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                  <p className="text-xs text-slate-500 mt-1">
                    By checking this box, I declare that all provided information is authentic and I accept the terms of the ACI Air Partner Agreement.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => setStep(2)} disabled={isLoading} className="h-12 px-8 rounded-xl font-semibold border-slate-300 text-slate-700 bg-white/80 hover:bg-white hover:text-slate-900 transition-all">
                Back to Documents
              </Button>
              <Button type="button" onClick={onSubmitFinal} disabled={isLoading || !termsAccepted} className={`h-12 px-10 rounded-xl shadow-lg font-bold tracking-wide transition-all duration-300 ${termsAccepted ? 'bg-gradient-to-r from-aci-green-500 to-aci-green-700 hover:from-aci-green-700 hover:to-aci-green-900 text-white shadow-aci-green-500/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}>
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Submit Application
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
