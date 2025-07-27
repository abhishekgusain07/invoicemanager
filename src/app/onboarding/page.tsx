"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(25);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    companySize: "",
    industry: "",
    useCase: "",
    preferredTools: [] as string[],
    features: [] as string[],
    goals: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (
    name: string,
    value: string,
    checked: boolean
  ) => {
    setFormData((prev) => {
      const currentArray = [...(prev[name as keyof typeof prev] as string[])];
      if (checked) {
        return { ...prev, [name]: [...currentArray, value] };
      } else {
        return {
          ...prev,
          [name]: currentArray.filter((item) => item !== value),
        };
      }
    });
  };

  const totalSteps = 4;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      setProgress((currentStep + 1) * (100 / totalSteps));
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setProgress((currentStep - 1) * (100 / totalSteps));
    }
  };

  const handleComplete = () => {
    // Here you would typically save the user preferences
    console.log("Form data submitted:", formData);
    // Navigate to dashboard after completing onboarding
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Set Up Your Account
          </CardTitle>
          <CardDescription className="text-center">
            Let's personalize your experience. This will only take a minute.
          </CardDescription>
          <Progress value={progress} className="h-2 mt-4" />
        </CardHeader>
        <CardContent>
          <div className="mx-auto w-full max-w-xs mb-6">
            <Stepper
              value={currentStep}
              onValueChange={setCurrentStep}
              orientation="horizontal"
              className="mb-8"
            >
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <StepperItem key={idx + 1} step={idx + 1} className="flex-1">
                  <StepperTrigger>
                    <StepperIndicator />
                  </StepperTrigger>
                  {idx < totalSteps - 1 && <StepperSeparator />}
                </StepperItem>
              ))}
            </Stepper>
          </div>

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">What's your name?</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">What's your role?</Label>
                <Select
                  onValueChange={(value: string) =>
                    handleSelectChange("role", value)
                  }
                  value={formData.role}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="product-manager">
                      Product Manager
                    </SelectItem>
                    <SelectItem value="founder">Founder</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Company */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-size">Company size</Label>
                <RadioGroup
                  onValueChange={(value: string) =>
                    handleSelectChange("companySize", value)
                  }
                  value={formData.companySize}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="solo" id="solo" />
                    <Label htmlFor="solo">Solo / Freelancer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2-10" id="small" />
                    <Label htmlFor="small">2-10 employees</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="11-50" id="medium" />
                    <Label htmlFor="medium">11-50 employees</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="51+" id="large" />
                    <Label htmlFor="large">51+ employees</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  onValueChange={(value: string) =>
                    handleSelectChange("industry", value)
                  }
                  value={formData.industry}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Use Cases */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>What features are you most interested in?</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "Authentication",
                    "Payments",
                    "Analytics",
                    "Database",
                    "UI Components",
                    "Deployment",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature.toLowerCase()}
                        checked={formData.features.includes(
                          feature.toLowerCase()
                        )}
                        onCheckedChange={(checked: boolean) =>
                          handleCheckboxChange(
                            "features",
                            feature.toLowerCase(),
                            checked
                          )
                        }
                      />
                      <Label htmlFor={feature.toLowerCase()}>{feature}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="use-case">Primary use case</Label>
                <Select
                  onValueChange={(value: string) =>
                    handleSelectChange("useCase", value)
                  }
                  value={formData.useCase}
                >
                  <SelectTrigger id="use-case">
                    <SelectValue placeholder="What will you build?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal-tool">Internal Tool</SelectItem>
                    <SelectItem value="consumer-app">Consumer App</SelectItem>
                    <SelectItem value="b2b-saas">B2B SaaS</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                    <SelectItem value="ecommerce">E-commerce Site</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 4: Goals */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goals">
                  What are your goals with our platform?
                </Label>
                <Textarea
                  id="goals"
                  name="goals"
                  placeholder="Tell us what you hope to achieve..."
                  className="min-h-[100px]"
                  value={formData.goals}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Which tools do you prefer to use?</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "React",
                    "Next.js",
                    "TypeScript",
                    "Tailwind CSS",
                    "Stripe",
                    "PostgreSQL",
                  ].map((tool) => (
                    <div key={tool} className="flex items-center space-x-2">
                      <Checkbox
                        id={tool.toLowerCase().replace(".", "-")}
                        checked={formData.preferredTools.includes(
                          tool.toLowerCase()
                        )}
                        onCheckedChange={(checked: boolean) =>
                          handleCheckboxChange(
                            "preferredTools",
                            tool.toLowerCase(),
                            checked as boolean
                          )
                        }
                      />
                      <Label htmlFor={tool.toLowerCase().replace(".", "-")}>
                        {tool}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          {currentStep < totalSteps ? (
            <Button onClick={nextStep}>Continue</Button>
          ) : (
            <Button onClick={handleComplete}>Complete Setup</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
