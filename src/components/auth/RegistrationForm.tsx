"use client";

import * as React from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { AlertCircle, Loader2, Upload, File, Check } from "lucide-react";
import { Button } from "@/components/auth/ui/button";
import { Input } from "@/components/auth/ui/input";
import { Label } from "@/components/auth/ui/label";
import { Select } from "@/components/auth/ui/select";
import { ALL_COUNTRIES, CountryDropdown } from "@/components/auth/CountryDropdown";
import { CityDropdown } from "@/components/auth/CityDropdown";
import { useRouter } from "next/navigation";

// --- Schemas ---
const partnerInfoSchema = z
  .object({
    ownerName: z.string().trim().min(2, "Enter the owner's full name"),
    companyName: z.string().trim().min(2, "Enter the company name"),
    caabNumber: z.string().trim().max(50, "CAAB number is too long").optional(),
    address: z.string().trim().min(5, "Enter a complete office address"),
    postalCode: z
      .string()
      .trim()
      .min(2, "Postal code is required")
      .max(12, "Postal code is too long"),
    dialCode: z.string().min(1, "Dial code is required"),
    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .regex(/^\d+$/, "Use digits only, without the country code or leading +"),
    country: z.string().min(1, "Country is required"),
    city: z.string().trim().min(2, "Enter a valid city or area"),
    currency: z.string().min(1, "Currency is required"),
    email: z
      .string()
      .trim()
      .min(1, "Email address is required")
      .email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
  .superRefine((data, ctx) => {
    const country = ALL_COUNTRIES.find((item) => item.name === data.country);

    if (country && data.dialCode !== country.dialCode) {
      ctx.addIssue({
        code: "custom",
        path: ["dialCode"],
        message: `${data.country} uses country code ${country.dialCode}`,
      });
    }

    if (country && /^\d+$/.test(data.phone)) {
      const phoneNumber = parsePhoneNumberFromString(`${country.dialCode}${data.phone}`);

      if (!phoneNumber || phoneNumber.country !== country.code || !phoneNumber.isValid()) {
        ctx.addIssue({
          code: "custom",
          path: ["phone"],
          message: `Enter a valid phone number for ${data.country}`,
        });
      }
    }
  });

type PartnerInfo = z.infer<typeof partnerInfoSchema>;
type DocumentType = "nid" | "tradeLicense" | "caabCertificate";
type Documents = Record<DocumentType, File | null>;
type DocumentErrors = Record<DocumentType, string | null>;

export function RegistrationForm() {
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAddressVerifying, setIsAddressVerifying] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const router = useRouter();

  // We use one form for the first step and custom state for documents to simplify the example
  const partnerForm = useForm<PartnerInfo>({
    resolver: zodResolver(partnerInfoSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      ownerName: "",
      companyName: "",
      caabNumber: "",
      email: "",
      password: "",
      dialCode: "+880",
      phone: "",
      address: "",
      postalCode: "",
      city: "",
      country: "Bangladesh",
      currency: "BDT",
    },
  });

  const [documents, setDocuments] = React.useState<Documents>({
    nid: null,
    tradeLicense: null,
    caabCertificate: null,
  });

  const [docErrors, setDocErrors] = React.useState<DocumentErrors>({
    nid: null,
    tradeLicense: null,
    caabCertificate: null,
  });
  const selectedCountryName = useWatch({ control: partnerForm.control, name: "country" });
  const selectedCountryCode = ALL_COUNTRIES.find(
    (country) => country.name === selectedCountryName,
  )?.code;
  const profileErrorMessages = Object.values(partnerForm.formState.errors)
    .map((error) => error?.message)
    .filter((message): message is string => typeof message === "string");

  const onStep1Submit = async (data: PartnerInfo) => {
    const country = ALL_COUNTRIES.find((item) => item.name === data.country);

    if (!country) {
      partnerForm.setError("country", { message: "Select a valid country" }, { shouldFocus: true });
      return;
    }

    setIsAddressVerifying(true);
    try {
      const response = await fetch("/api/validate-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          countryCode: country.code,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        partnerForm.setError(
          "postalCode",
          {
            message: result.error ?? "Address verification is temporarily unavailable",
          },
          { shouldFocus: true },
        );
        return;
      }

      if (result.configured && !result.valid) {
        partnerForm.setError(
          "postalCode",
          {
            message: "Postal code was not found for the selected country",
          },
          { shouldFocus: true },
        );
        return;
      }

      setStep(2);
    } catch {
      partnerForm.setError(
        "postalCode",
        {
          message: "Address verification is temporarily unavailable",
        },
        { shouldFocus: true },
      );
    } finally {
      setIsAddressVerifying(false);
    }
  };

  const onNextStep2 = () => {
    const nidValid = !!documents.nid;
    const tradeValid = !!documents.tradeLicense;

    setDocErrors((prev) => ({
      ...prev,
      nid: nidValid ? null : "NID document is required to proceed",
      tradeLicense: tradeValid ? null : "Trade License is required to proceed",
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

  const handleFileUpload = (type: DocumentType, file: File | null) => {
    if (file) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      // Some OS might provide empty types for certain extensions, or we can just check the extension as a fallback
      const extension = file.name.split(".").pop()?.toLowerCase();
      const allowedExtensions = ["pdf", "jpg", "jpeg", "png"];

      if (
        !allowedTypes.includes(file.type) &&
        (!extension || !allowedExtensions.includes(extension))
      ) {
        setDocErrors((prev) => ({
          ...prev,
          [type]: "Invalid format. Please upload a PDF, JPG, or PNG file.",
        }));
        // Clear the invalid file
        setDocuments((prev) => ({ ...prev, [type]: null }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setDocErrors((prev) => ({ ...prev, [type]: "File is too large. Maximum size is 5 MB." }));
        setDocuments((prev) => ({ ...prev, [type]: null }));
        return;
      }
    }

    setDocuments((prev) => ({ ...prev, [type]: file }));
    setDocErrors((prev) => ({ ...prev, [type]: null }));
  };

  return (
    <div className="registration-form flex flex-col gap-10 w-full">
      {/* Premium Stepper */}
      <div className="registration-stepper flex items-center justify-center mb-2 px-4 md:px-12 w-full max-w-2xl mx-auto">
        <div
          className={`flex flex-col items-center gap-2 relative z-10 transition-colors duration-300 ${step >= 1 ? "text-aci-blue-700" : "text-slate-400"}`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-500 ${step >= 1 ? "bg-gradient-to-br from-aci-blue-500 to-aci-blue-700 text-white shadow-aci-blue-500/30" : "bg-white border border-slate-200 text-slate-400"}`}
          >
            {step > 1 ? <Check size={20} strokeWidth={3} /> : "1"}
          </div>
          <span className="text-sm font-semibold tracking-wide hidden md:block">Profile</span>
        </div>
        <div
          className={`flex-1 h-[2px] mx-2 md:mx-4 transition-all duration-500 ${step >= 2 ? "bg-aci-blue-500" : "bg-slate-200"}`}
        ></div>
        <div
          className={`flex flex-col items-center gap-2 relative z-10 transition-colors duration-300 ${step >= 2 ? "text-aci-blue-700" : "text-slate-400"}`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-500 ${step >= 2 ? "bg-gradient-to-br from-aci-blue-500 to-aci-blue-700 text-white shadow-aci-blue-500/30" : "bg-white border border-slate-200 text-slate-400"}`}
          >
            {step > 2 ? <Check size={20} strokeWidth={3} /> : "2"}
          </div>
          <span className="text-sm font-semibold tracking-wide hidden md:block">Documents</span>
        </div>
        <div
          className={`flex-1 h-[2px] mx-2 md:mx-4 transition-all duration-500 ${step >= 3 ? "bg-aci-blue-500" : "bg-slate-200"}`}
        ></div>
        <div
          className={`flex flex-col items-center gap-2 relative z-10 transition-colors duration-300 ${step >= 3 ? "text-aci-blue-700" : "text-slate-400"}`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-500 ${step >= 3 ? "bg-gradient-to-br from-aci-blue-500 to-aci-blue-700 text-white shadow-aci-blue-500/30" : "bg-white border border-slate-200 text-slate-400"}`}
          >
            3
          </div>
          <span className="text-sm font-semibold tracking-wide hidden md:block">Review</span>
        </div>
      </div>

      <div className="registration-panel bg-white/40 border border-white/60 rounded-3xl p-6 md:p-8 shadow-sm">
        {/* Step 1: Partner Information */}
        {step === 1 && (
          <form
            noValidate
            onSubmit={partnerForm.handleSubmit(onStep1Submit)}
            className="registration-profile-form flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {profileErrorMessages.length > 0 && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold">Please correct the highlighted fields</p>
                  <p className="mt-0.5 text-xs">
                    {profileErrorMessages.length}{" "}
                    {profileErrorMessages.length === 1 ? "field needs" : "fields need"} your
                    attention.
                  </p>
                </div>
              </div>
            )}
            <div className="registration-fields grid grid-cols-2 gap-6 lg:grid-cols-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ownerName" className="text-slate-700 font-semibold ml-1">
                  Owner Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ownerName"
                  {...partnerForm.register("ownerName")}
                  aria-invalid={!!partnerForm.formState.errors.ownerName}
                  aria-describedby={
                    partnerForm.formState.errors.ownerName ? "ownerName-error" : undefined
                  }
                />
                {partnerForm.formState.errors.ownerName && (
                  <span
                    id="ownerName-error"
                    role="alert"
                    className="text-xs text-red-600 ml-1 font-medium"
                  >
                    {partnerForm.formState.errors.ownerName.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="companyName" className="text-slate-700 font-semibold ml-1">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  {...partnerForm.register("companyName")}
                  aria-invalid={!!partnerForm.formState.errors.companyName}
                  aria-describedby={
                    partnerForm.formState.errors.companyName ? "companyName-error" : undefined
                  }
                />
                {partnerForm.formState.errors.companyName && (
                  <span
                    id="companyName-error"
                    role="alert"
                    className="text-xs text-red-600 ml-1 font-medium"
                  >
                    {partnerForm.formState.errors.companyName.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="caabNumber" className="text-slate-700 font-semibold ml-1">
                  CAAB Number <span className="text-xs font-normal text-slate-400">(Optional)</span>
                </Label>
                <Input
                  id="caabNumber"
                  placeholder="Enter CAAB number"
                  {...partnerForm.register("caabNumber")}
                  aria-invalid={!!partnerForm.formState.errors.caabNumber}
                  aria-describedby={
                    partnerForm.formState.errors.caabNumber ? "caabNumber-error" : undefined
                  }
                />
                {partnerForm.formState.errors.caabNumber && (
                  <span
                    id="caabNumber-error"
                    role="alert"
                    className="text-xs text-red-600 ml-1 font-medium"
                  >
                    {partnerForm.formState.errors.caabNumber.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold ml-1">
                  Partner Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...partnerForm.register("email")}
                  aria-invalid={!!partnerForm.formState.errors.email}
                  aria-describedby={partnerForm.formState.errors.email ? "email-error" : undefined}
                />
                {partnerForm.formState.errors.email && (
                  <span
                    id="email-error"
                    role="alert"
                    className="text-xs text-red-600 ml-1 font-medium"
                  >
                    {partnerForm.formState.errors.email.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-slate-700 font-semibold ml-1">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...partnerForm.register("password")}
                  aria-invalid={!!partnerForm.formState.errors.password}
                  aria-describedby={
                    partnerForm.formState.errors.password ? "password-error" : undefined
                  }
                />
                {partnerForm.formState.errors.password && (
                  <span
                    id="password-error"
                    role="alert"
                    className="text-xs text-red-600 ml-1 font-medium"
                  >
                    {partnerForm.formState.errors.password.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone" className="text-slate-700 font-semibold ml-1">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Controller
                    control={partnerForm.control}
                    name="dialCode"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="dialCode"
                        readOnly
                        tabIndex={-1}
                        aria-label="Country calling code"
                        aria-invalid={!!partnerForm.formState.errors.dialCode}
                        className="w-1/3 cursor-default bg-slate-50 font-semibold text-slate-600"
                      />
                    )}
                  />
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    className="w-2/3"
                    placeholder="National number"
                    {...partnerForm.register("phone")}
                    aria-invalid={!!partnerForm.formState.errors.phone}
                    aria-describedby={
                      partnerForm.formState.errors.phone || partnerForm.formState.errors.dialCode
                        ? "phone-error"
                        : undefined
                    }
                  />
                </div>
                {(partnerForm.formState.errors.phone || partnerForm.formState.errors.dialCode) && (
                  <span
                    id="phone-error"
                    role="alert"
                    className="text-xs text-red-600 ml-1 font-medium"
                  >
                    {partnerForm.formState.errors.phone?.message ||
                      partnerForm.formState.errors.dialCode?.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="country" className="text-slate-700 font-semibold ml-1">
                  Country/Region <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={partnerForm.control}
                  name="country"
                  render={({ field }) => (
                    <CountryDropdown
                      placeholder="Select a country"
                      defaultValue={field.value}
                      onChange={(country) => {
                        field.onChange(country.name);
                        partnerForm.setValue("dialCode", country.dialCode, {
                          shouldDirty: true,
                          shouldValidate: false,
                        });
                        partnerForm.setValue("city", "", {
                          shouldDirty: true,
                          shouldValidate: false,
                        });
                        partnerForm.setValue("postalCode", "", {
                          shouldDirty: true,
                          shouldValidate: false,
                        });
                        partnerForm.clearErrors(["country", "dialCode", "city", "postalCode"]);
                      }}
                      aria-invalid={!!partnerForm.formState.errors.country}
                    />
                  )}
                />
                {partnerForm.formState.errors.country && (
                  <span
                    id="country-error"
                    role="alert"
                    className="text-xs text-red-600 ml-1 font-medium"
                  >
                    {partnerForm.formState.errors.country.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="city" className="text-slate-700 font-semibold ml-1">
                  City/Area <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={partnerForm.control}
                  name="city"
                  render={({ field }) => (
                    <CityDropdown
                      countryCode={selectedCountryCode ?? ""}
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={!!partnerForm.formState.errors.city}
                    />
                  )}
                />
                {partnerForm.formState.errors.city && (
                  <span
                    id="city-error"
                    role="alert"
                    className="text-xs text-red-600 ml-1 font-medium"
                  >
                    {partnerForm.formState.errors.city.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2 col-span-2 lg:col-span-4">
                <Label htmlFor="address" className="text-slate-700 font-semibold ml-1">
                  Office Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  autoComplete="street-address"
                  {...partnerForm.register("address")}
                  aria-invalid={!!partnerForm.formState.errors.address}
                  aria-describedby={
                    partnerForm.formState.errors.address ? "address-error" : undefined
                  }
                />
                {partnerForm.formState.errors.address && (
                  <span
                    id="address-error"
                    role="alert"
                    className="text-xs text-red-600 ml-1 font-medium"
                  >
                    {partnerForm.formState.errors.address.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="postalCode" className="text-slate-700 font-semibold ml-1">
                  Postal Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="postalCode"
                  autoComplete="postal-code"
                  {...partnerForm.register("postalCode")}
                  aria-invalid={!!partnerForm.formState.errors.postalCode}
                  aria-describedby={
                    partnerForm.formState.errors.postalCode ? "postalCode-error" : undefined
                  }
                />
                {partnerForm.formState.errors.postalCode && (
                  <span
                    id="postalCode-error"
                    role="alert"
                    className="text-xs text-red-600 ml-1 font-medium"
                  >
                    {partnerForm.formState.errors.postalCode.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="currency" className="text-slate-700 font-semibold ml-1">
                  Operating Currency <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="currency"
                  {...partnerForm.register("currency")}
                  aria-invalid={!!partnerForm.formState.errors.currency}
                  aria-describedby={
                    partnerForm.formState.errors.currency ? "currency-error" : undefined
                  }
                >
                  <option value="">Select a currency</option>
                  <option value="BDT">BDT (Bangladeshi Taka)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (British Pound)</option>
                </Select>
                {partnerForm.formState.errors.currency && (
                  <span
                    id="currency-error"
                    role="alert"
                    className="text-xs text-red-600 ml-1 font-medium"
                  >
                    {partnerForm.formState.errors.currency.message}
                  </span>
                )}
              </div>
            </div>
            <div className="registration-actions flex justify-end mt-4">
              <Button
                type="submit"
                disabled={isAddressVerifying}
                className="bg-gradient-to-r from-aci-blue-500 to-aci-blue-700 hover:from-aci-blue-700 hover:to-aci-blue-900 text-white w-full md:w-auto h-12 px-8 rounded-xl shadow-lg shadow-aci-blue-500/20 font-semibold tracking-wide transition-all duration-300"
              >
                {isAddressVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAddressVerifying ? "Verifying address..." : "Continue to Documents"}
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div
                className={`group relative min-w-0 overflow-hidden rounded-2xl border-2 border-dashed p-4 transition-all duration-300 ${docErrors.nid ? "border-red-400 bg-red-50/50" : documents.nid ? "border-aci-blue-500 bg-aci-blue-50/50" : "border-slate-300 bg-white/50 hover:border-aci-blue-400 hover:bg-white/80 hover:shadow-md"}`}
              >
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => handleFileUpload("nid", e.target.files?.[0] || null)}
                  aria-invalid={!!docErrors.nid}
                />
                <div className="pointer-events-none flex h-full flex-col">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${documents.nid ? "bg-aci-blue-100 text-aci-blue-600" : "bg-white text-slate-400 shadow-sm group-hover:text-aci-blue-500"}`}
                    >
                      {documents.nid ? <Check size={20} strokeWidth={2.5} /> : <Upload size={20} />}
                    </div>
                    <h3 className="font-bold text-slate-800">
                      National ID <span className="text-red-500">*</span>
                    </h3>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Owner&apos;s clear scanned ID or photo.
                  </p>
                  {documents.nid ? (
                    <div className="mt-3 flex min-w-0 items-center gap-2 rounded-lg border border-aci-blue-200 bg-white px-3 py-2">
                      <File size={14} className="shrink-0 text-aci-blue-500" />
                      <span className="truncate text-xs font-semibold text-slate-700">
                        {documents.nid.name}
                      </span>
                    </div>
                  ) : (
                    <span className="mt-3 text-xs font-bold text-aci-blue-600">Choose file</span>
                  )}
                  {docErrors.nid && (
                    <p role="alert" className="mt-2 text-xs font-bold text-red-600">
                      {docErrors.nid}
                    </p>
                  )}
                </div>
              </div>

              <div
                className={`group relative min-w-0 overflow-hidden rounded-2xl border-2 border-dashed p-4 transition-all duration-300 ${docErrors.tradeLicense ? "border-red-400 bg-red-50/50" : documents.tradeLicense ? "border-aci-blue-500 bg-aci-blue-50/50" : "border-slate-300 bg-white/50 hover:border-aci-blue-400 hover:bg-white/80 hover:shadow-md"}`}
              >
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => handleFileUpload("tradeLicense", e.target.files?.[0] || null)}
                  aria-invalid={!!docErrors.tradeLicense}
                />
                <div className="pointer-events-none flex h-full flex-col">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${documents.tradeLicense ? "bg-aci-blue-100 text-aci-blue-600" : "bg-white text-slate-400 shadow-sm group-hover:text-aci-blue-500"}`}
                    >
                      {documents.tradeLicense ? (
                        <Check size={20} strokeWidth={2.5} />
                      ) : (
                        <Upload size={20} />
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800">
                      Trade License <span className="text-red-500">*</span>
                    </h3>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Your company&apos;s valid current license.
                  </p>
                  {documents.tradeLicense ? (
                    <div className="mt-3 flex min-w-0 items-center gap-2 rounded-lg border border-aci-blue-200 bg-white px-3 py-2">
                      <File size={14} className="shrink-0 text-aci-blue-500" />
                      <span className="truncate text-xs font-semibold text-slate-700">
                        {documents.tradeLicense.name}
                      </span>
                    </div>
                  ) : (
                    <span className="mt-3 text-xs font-bold text-aci-blue-600">Choose file</span>
                  )}
                  {docErrors.tradeLicense && (
                    <p role="alert" className="mt-2 text-xs font-bold text-red-600">
                      {docErrors.tradeLicense}
                    </p>
                  )}
                </div>
              </div>

              <div
                className={`group relative min-w-0 overflow-hidden rounded-2xl border-2 border-dashed p-4 transition-all duration-300 ${docErrors.caabCertificate ? "border-red-400 bg-red-50/50" : documents.caabCertificate ? "border-aci-blue-500 bg-aci-blue-50/50" : "border-slate-300 bg-white/50 hover:border-aci-blue-400 hover:bg-white/80 hover:shadow-md"}`}
              >
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => handleFileUpload("caabCertificate", e.target.files?.[0] || null)}
                  aria-invalid={!!docErrors.caabCertificate}
                />
                <div className="pointer-events-none flex h-full flex-col">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${documents.caabCertificate ? "bg-aci-blue-100 text-aci-blue-600" : "bg-white text-slate-400 shadow-sm group-hover:text-aci-blue-500"}`}
                    >
                      {documents.caabCertificate ? (
                        <Check size={20} strokeWidth={2.5} />
                      ) : (
                        <Upload size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">CAAB Certificate</h3>
                      <span className="text-xs text-slate-400">Optional</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Civil Aviation Authority certificate.
                  </p>
                  {documents.caabCertificate ? (
                    <div className="mt-3 flex min-w-0 items-center gap-2 rounded-lg border border-aci-blue-200 bg-white px-3 py-2">
                      <File size={14} className="shrink-0 text-aci-blue-500" />
                      <span className="truncate text-xs font-semibold text-slate-700">
                        {documents.caabCertificate.name}
                      </span>
                    </div>
                  ) : (
                    <span className="mt-3 text-xs font-bold text-slate-500 group-hover:text-aci-blue-600">
                      Choose file
                    </span>
                  )}
                  {docErrors.caabCertificate && (
                    <p role="alert" className="mt-2 text-xs font-bold text-red-600">
                      {docErrors.caabCertificate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-4 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="h-12 px-8 rounded-xl font-semibold border-slate-300 text-slate-700 bg-white/80 hover:bg-white hover:text-slate-900 transition-all"
              >
                Back to Profile
              </Button>
              <Button
                type="button"
                onClick={onNextStep2}
                className="bg-gradient-to-r from-aci-blue-500 to-aci-blue-700 hover:from-aci-blue-700 hover:to-aci-blue-900 text-white h-12 px-8 rounded-xl shadow-lg shadow-aci-blue-500/20 font-semibold tracking-wide transition-all duration-300"
              >
                Continue to Review
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="registration-review flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="registration-review-profile grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="registration-review-card bg-white/70 border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 text-lg border-b border-slate-200/60 pb-3 mb-4">
                  Partner Identity
                </h3>
                <div className="flex flex-col gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                      Owner Name
                    </span>{" "}
                    <span className="font-semibold text-slate-800">
                      {partnerForm.getValues("ownerName")}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                      Company Name
                    </span>{" "}
                    <span className="font-semibold text-slate-800">
                      {partnerForm.getValues("companyName")}
                    </span>
                  </div>
                  {partnerForm.getValues("caabNumber") && (
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                        CAAB Number
                      </span>{" "}
                      <span className="font-semibold text-slate-800">
                        {partnerForm.getValues("caabNumber")}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                      Operating Currency
                    </span>{" "}
                    <span className="font-semibold text-slate-800">
                      {partnerForm.getValues("currency")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="registration-review-card bg-white/70 border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 text-lg border-b border-slate-200/60 pb-3 mb-4">
                  Contact & Location
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex min-w-0 flex-col">
                    <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                      Email
                    </span>{" "}
                    <span className="font-semibold text-slate-800 break-all">
                      {partnerForm.getValues("email")}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                      Phone
                    </span>{" "}
                    <span className="font-semibold text-slate-800">
                      {partnerForm.getValues("dialCode")} {partnerForm.getValues("phone")}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                      Country
                    </span>{" "}
                    <span className="font-semibold text-slate-800">
                      {partnerForm.getValues("country")}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                      City
                    </span>{" "}
                    <span className="font-semibold text-slate-800">
                      {partnerForm.getValues("city")}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                      Postal Code
                    </span>{" "}
                    <span className="font-semibold text-slate-800">
                      {partnerForm.getValues("postalCode")}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-col sm:col-span-2">
                    <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                      Office Address
                    </span>{" "}
                    <span className="font-semibold text-slate-800 break-words">
                      {partnerForm.getValues("address")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="registration-review-documents bg-white/70 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-lg border-b border-slate-200/60 pb-3 mb-4">
                Documents Provided
              </h3>
              <div className="flex flex-col sm:flex-row gap-6 text-sm">
                <div className="flex items-center gap-3 bg-aci-blue-50/50 px-4 py-3 rounded-xl border border-aci-blue-100 flex-1">
                  <Check
                    size={20}
                    className="text-aci-blue-500 bg-white rounded-full p-0.5 shadow-sm"
                  />{" "}
                  <span className="font-semibold text-slate-700">NID Uploaded</span>
                </div>
                <div className="flex items-center gap-3 bg-aci-blue-50/50 px-4 py-3 rounded-xl border border-aci-blue-100 flex-1">
                  <Check
                    size={20}
                    className="text-aci-blue-500 bg-white rounded-full p-0.5 shadow-sm"
                  />{" "}
                  <span className="font-semibold text-slate-700">Trade License Uploaded</span>
                </div>
                {documents.caabCertificate && (
                  <div className="flex items-center gap-3 bg-aci-blue-50/50 px-4 py-3 rounded-xl border border-aci-blue-100 flex-1">
                    <Check
                      size={20}
                      className="text-aci-blue-500 bg-white rounded-full p-0.5 shadow-sm"
                    />{" "}
                    <span className="font-semibold text-slate-700">CAAB Cert. Uploaded</span>
                  </div>
                )}
              </div>
            </div>

            <div className="registration-review-legal bg-white/70 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-lg border-b border-slate-200/60 pb-3 mb-4">
                Legal Declarations
              </h3>
              <div className="flex items-start gap-3">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id="terms"
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-aci-blue-600 focus:ring-aci-blue-500 cursor-pointer"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="terms"
                    className="text-sm font-semibold text-slate-700 cursor-pointer"
                  >
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                  <p className="text-xs text-slate-500 mt-1">
                    By checking this box, I declare that all provided information is authentic and I
                    accept the terms of the ACI Air Partner Agreement.
                  </p>
                </div>
              </div>
            </div>

            <div className="registration-review-actions flex flex-col md:flex-row justify-between gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                disabled={isLoading}
                className="h-12 px-8 rounded-xl font-semibold border-slate-300 text-slate-700 bg-white/80 hover:bg-white hover:text-slate-900 transition-all"
              >
                Back to Documents
              </Button>
              <Button
                type="button"
                onClick={onSubmitFinal}
                disabled={isLoading || !termsAccepted}
                className={`h-12 px-10 rounded-xl shadow-lg font-bold tracking-wide transition-all duration-300 ${termsAccepted ? "bg-gradient-to-r from-aci-blue-500 to-aci-blue-700 hover:from-aci-blue-700 hover:to-aci-blue-900 text-white shadow-aci-blue-500/20" : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"}`}
              >
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
