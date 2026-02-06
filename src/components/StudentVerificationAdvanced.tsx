import React, { useState, useRef } from 'react';
import { 
  GraduationCap, Check, AlertCircle, Loader2, ChevronRight, ChevronLeft,
  User, MapPin, School, FileText, CreditCard, Upload, Shield, X
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

const WEST_AFRICAN_COUNTRIES = [
  { name: 'Nigeria', states: ['Lagos', 'Abuja FCT', 'Kano', 'Rivers', 'Oyo', 'Kaduna', 'Delta', 'Ogun', 'Edo', 'Anambra', 'Enugu', 'Imo', 'Abia', 'Katsina', 'Plateau', 'Kwara', 'Osun', 'Cross River', 'Akwa Ibom', 'Borno'] },
  { name: 'Ghana', states: ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Northern', 'Volta'] },
  { name: 'Senegal', states: ['Dakar', 'Thies', 'Saint-Louis', 'Kaolack', 'Ziguinchor'] },
  { name: 'Côte d\'Ivoire', states: ['Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro'] },
  { name: 'Mali', states: ['Bamako', 'Sikasso', 'Mopti', 'Koulikoro'] },
  { name: 'Burkina Faso', states: ['Centre', 'Hauts-Bassins', 'Est', 'Boucle du Mouhoun'] },
  { name: 'Niger', states: ['Niamey', 'Zinder', 'Maradi', 'Tahoua'] },
  { name: 'Guinea', states: ['Conakry', 'Nzérékoré', 'Kankan', 'Kindia'] },
  { name: 'Benin', states: ['Littoral', 'Atlantique', 'Ouémé', 'Borgou'] },
  { name: 'Togo', states: ['Maritime', 'Plateaux', 'Centrale', 'Kara'] },
  { name: 'Sierra Leone', states: ['Western Area', 'Eastern', 'Northern', 'Southern'] },
  { name: 'Liberia', states: ['Montserrado', 'Nimba', 'Bong', 'Lofa'] },
  { name: 'Gambia', states: ['Banjul', 'Western', 'North Bank', 'Central River'] },
  { name: 'Guinea-Bissau', states: ['Bissau', 'Gabú', 'Bafatá'] },
  { name: 'Cape Verde', states: ['Santiago', 'São Vicente', 'Santo Antão'] },
];

const INSTITUTION_TYPES = [
  'University',
  'Polytechnic',
  'College of Education',
  'Monotechnic',
  'Secondary School',
  'Technical College',
];

interface StudentVerificationAdvancedProps {
  userId: string;
  onComplete: () => void;
  onClose: () => void;
}

interface FormData {
  // Step 1: Personal Info
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  
  // Step 2: Location
  country: string;
  stateProvince: string;
  city: string;
  
  // Step 3: Institution
  institutionName: string;
  institutionType: string;
  studentId: string;
  enrollmentYear: string;
  expectedGraduation: string;
  
  // Step 4: WAEC
  waecExamNumber: string;
  waecYear: string;
  waecCenter: string;
  
  // Step 5: NIN
  ninNumber: string;
  
  // Step 6: Documents
  studentIdFile: File | null;
  waecResultFile: File | null;
  ninSlipFile: File | null;
  admissionLetterFile: File | null;
  
  // Step 7: Declaration
  declarationAgreed: boolean;
  termsAgreed: boolean;
}

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User, description: 'Your basic details' },
  { id: 2, title: 'Location', icon: MapPin, description: 'Where you\'re from' },
  { id: 3, title: 'Institution', icon: School, description: 'Your school details' },
  { id: 4, title: 'WAEC Details', icon: FileText, description: 'Examination info' },
  { id: 5, title: 'NIN Verification', icon: CreditCard, description: 'National ID' },
  { id: 6, title: 'Documents', icon: Upload, description: 'Upload proofs' },
  { id: 7, title: 'Declaration', icon: Shield, description: 'Final confirmation' },
];

export const StudentVerificationAdvanced: React.FC<StudentVerificationAdvancedProps> = ({ 
  userId, 
  onComplete, 
  onClose 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    dateOfBirth: '',
    phoneNumber: '',
    country: '',
    stateProvince: '',
    city: '',
    institutionName: '',
    institutionType: '',
    studentId: '',
    enrollmentYear: '',
    expectedGraduation: '',
    waecExamNumber: '',
    waecYear: '',
    waecCenter: '',
    ninNumber: '',
    studentIdFile: null,
    waecResultFile: null,
    ninSlipFile: null,
    admissionLetterFile: null,
    declarationAgreed: false,
    termsAgreed: false,
  });

  const fileInputRefs = {
    studentId: useRef<HTMLInputElement>(null),
    waecResult: useRef<HTMLInputElement>(null),
    ninSlip: useRef<HTMLInputElement>(null),
    admissionLetter: useRef<HTMLInputElement>(null),
  };

  const selectedCountryData = WEST_AFRICAN_COUNTRIES.find(c => c.name === formData.country);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${folder}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, file);
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }
    
    const { data } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.fullName || !formData.dateOfBirth || !formData.phoneNumber) {
          toast.error('Please fill in all personal information');
          return false;
        }
        break;
      case 2:
        if (!formData.country || !formData.stateProvince || !formData.city) {
          toast.error('Please fill in all location details');
          return false;
        }
        break;
      case 3:
        if (!formData.institutionName || !formData.institutionType || !formData.studentId) {
          toast.error('Please fill in all institution details');
          return false;
        }
        break;
      case 4:
        if (!formData.waecExamNumber || !formData.waecYear) {
          toast.error('Please provide your WAEC details');
          return false;
        }
        break;
      case 5:
        if (!formData.ninNumber) {
          toast.error('Please provide your NIN number');
          return false;
        }
        if (formData.ninNumber.length !== 11) {
          toast.error('NIN must be 11 digits');
          return false;
        }
        break;
      case 6:
        if (!formData.studentIdFile && !formData.waecResultFile) {
          toast.error('Please upload at least your Student ID or WAEC Result');
          return false;
        }
        break;
      case 7:
        if (!formData.declarationAgreed || !formData.termsAgreed) {
          toast.error('Please agree to all terms and declarations');
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    try {
      // Upload documents
      let studentIdUrl = null;
      let waecResultUrl = null;
      let ninSlipUrl = null;
      let admissionLetterUrl = null;

      if (formData.studentIdFile) {
        studentIdUrl = await uploadFile(formData.studentIdFile, 'student-id');
      }
      if (formData.waecResultFile) {
        waecResultUrl = await uploadFile(formData.waecResultFile, 'waec-result');
      }
      if (formData.ninSlipFile) {
        ninSlipUrl = await uploadFile(formData.ninSlipFile, 'nin-slip');
      }
      if (formData.admissionLetterFile) {
        admissionLetterUrl = await uploadFile(formData.admissionLetterFile, 'admission-letter');
      }

      // Create verification record
      const { error } = await supabase
        .from('student_verifications')
        .insert({
          user_id: userId,
          full_name: formData.fullName,
          date_of_birth: formData.dateOfBirth,
          phone_number: formData.phoneNumber,
          country: formData.country,
          state_province: formData.stateProvince,
          city: formData.city,
          institution_name: formData.institutionName,
          institution_type: formData.institutionType,
          student_id: formData.studentId,
          enrollment_year: parseInt(formData.enrollmentYear),
          expected_graduation: parseInt(formData.expectedGraduation),
          waec_exam_number: formData.waecExamNumber,
          waec_year: parseInt(formData.waecYear),
          waec_center: formData.waecCenter,
          nin_number: formData.ninNumber,
          student_id_url: studentIdUrl,
          waec_result_url: waecResultUrl,
          nin_slip_url: ninSlipUrl,
          admission_letter_url: admissionLetterUrl,
          declaration_agreed: formData.declarationAgreed,
          terms_agreed: formData.termsAgreed,
          current_step: 7,
          status: 'pending',
        });

      if (error) throw error;

      // Update profile verification status
      await supabase
        .from('profiles')
        .update({ student_verification_status: 'pending' })
        .eq('user_id', userId);

      toast.success('Verification submitted successfully! We\'ll review within 24-48 hours.');
      onComplete();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Full Legal Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => updateFormData('fullName', e.target.value)}
                placeholder="As it appears on your ID"
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                placeholder="+234 xxx xxx xxxx"
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Country</label>
              <select
                value={formData.country}
                onChange={(e) => {
                  updateFormData('country', e.target.value);
                  updateFormData('stateProvince', '');
                }}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select your country</option>
                {WEST_AFRICAN_COUNTRIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">State/Province</label>
              <select
                value={formData.stateProvince}
                onChange={(e) => updateFormData('stateProvince', e.target.value)}
                disabled={!formData.country}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              >
                <option value="">Select state/province</option>
                {selectedCountryData?.states.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateFormData('city', e.target.value)}
                placeholder="Your city"
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Institution Name</label>
              <input
                type="text"
                value={formData.institutionName}
                onChange={(e) => updateFormData('institutionName', e.target.value)}
                placeholder="e.g., University of Lagos"
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Institution Type</label>
              <select
                value={formData.institutionType}
                onChange={(e) => updateFormData('institutionType', e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select type</option>
                {INSTITUTION_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Student ID / Matric Number</label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => updateFormData('studentId', e.target.value)}
                placeholder="Your student ID"
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Enrollment Year</label>
                <input
                  type="number"
                  value={formData.enrollmentYear}
                  onChange={(e) => updateFormData('enrollmentYear', e.target.value)}
                  placeholder="2020"
                  min="2000"
                  max="2026"
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Expected Graduation</label>
                <input
                  type="number"
                  value={formData.expectedGraduation}
                  onChange={(e) => updateFormData('expectedGraduation', e.target.value)}
                  placeholder="2024"
                  min="2020"
                  max="2035"
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-oracle-purple/10 border border-oracle-purple/20 mb-4">
              <p className="text-xs text-oracle-purple">
                WAEC (West African Examinations Council) verification helps us confirm your student status in West Africa.
              </p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">WAEC Examination Number</label>
              <input
                type="text"
                value={formData.waecExamNumber}
                onChange={(e) => updateFormData('waecExamNumber', e.target.value.toUpperCase())}
                placeholder="e.g., 4250101001"
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Examination Year</label>
              <select
                value={formData.waecYear}
                onChange={(e) => updateFormData('waecYear', e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select year</option>
                {Array.from({ length: 15 }, (_, i) => 2026 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Examination Center (Optional)</label>
              <input
                type="text"
                value={formData.waecCenter}
                onChange={(e) => updateFormData('waecCenter', e.target.value)}
                placeholder="Your examination center"
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 mb-4">
              <p className="text-xs text-primary">
                Your National Identification Number (NIN) helps us verify your identity. This is required for Nigerian students.
              </p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">NIN (11 digits)</label>
              <input
                type="text"
                value={formData.ninNumber}
                onChange={(e) => updateFormData('ninNumber', e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="12345678901"
                maxLength={11}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono tracking-wider"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {formData.ninNumber.length}/11 digits
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground mb-4">
              Upload clear photos or scans of your documents. At least Student ID or WAEC Result is required.
            </p>
            
            {/* Student ID */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Student ID Card</span>
                  {formData.studentIdFile && <Check className="w-4 h-4 text-oracle-green" />}
                </div>
                <button
                  onClick={() => fileInputRefs.studentId.current?.click()}
                  className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {formData.studentIdFile ? 'Change' : 'Upload'}
                </button>
              </div>
              <input
                ref={fileInputRefs.studentId}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => updateFormData('studentIdFile', e.target.files?.[0] || null)}
              />
              {formData.studentIdFile && (
                <p className="text-[10px] text-muted-foreground mt-2 truncate">{formData.studentIdFile.name}</p>
              )}
            </div>

            {/* WAEC Result */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">WAEC Result</span>
                  {formData.waecResultFile && <Check className="w-4 h-4 text-oracle-green" />}
                </div>
                <button
                  onClick={() => fileInputRefs.waecResult.current?.click()}
                  className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {formData.waecResultFile ? 'Change' : 'Upload'}
                </button>
              </div>
              <input
                ref={fileInputRefs.waecResult}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => updateFormData('waecResultFile', e.target.files?.[0] || null)}
              />
              {formData.waecResultFile && (
                <p className="text-[10px] text-muted-foreground mt-2 truncate">{formData.waecResultFile.name}</p>
              )}
            </div>

            {/* NIN Slip */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">NIN Slip (Optional)</span>
                  {formData.ninSlipFile && <Check className="w-4 h-4 text-oracle-green" />}
                </div>
                <button
                  onClick={() => fileInputRefs.ninSlip.current?.click()}
                  className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {formData.ninSlipFile ? 'Change' : 'Upload'}
                </button>
              </div>
              <input
                ref={fileInputRefs.ninSlip}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => updateFormData('ninSlipFile', e.target.files?.[0] || null)}
              />
            </div>

            {/* Admission Letter */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Admission Letter (Optional)</span>
                  {formData.admissionLetterFile && <Check className="w-4 h-4 text-oracle-green" />}
                </div>
                <button
                  onClick={() => fileInputRefs.admissionLetter.current?.click()}
                  className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {formData.admissionLetterFile ? 'Change' : 'Upload'}
                </button>
              </div>
              <input
                ref={fileInputRefs.admissionLetter}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => updateFormData('admissionLetterFile', e.target.files?.[0] || null)}
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-oracle-gold/10 border border-oracle-gold/20">
              <h4 className="text-sm font-medium text-oracle-gold mb-2">Student Benefits</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Free access to Preview & Experimental models</li>
                <li>• Only 10% profit share on successful trades</li>
                <li>• Priority support for West African students</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.declarationAgreed}
                  onChange={(e) => updateFormData('declarationAgreed', e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground">
                  I declare that all information provided is true and accurate. I understand that false information will result in account termination and loss of student benefits.
                </span>
              </label>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.termsAgreed}
                  onChange={(e) => updateFormData('termsAgreed', e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground">
                  I agree to the 10% profit share on all trades made using the Preview and Experimental models as part of the Student Support program.
                </span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progress = (currentStep / 7) * 100;
  const currentStepData = STEPS.find(s => s.id === currentStep)!;
  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-oracle-purple/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-oracle-purple" />
            </div>
            <div>
              <h2 className="font-semibold">Student Verification</h2>
              <p className="text-xs text-muted-foreground">Step {currentStep} of 7</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-4 pt-4">
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Step indicator */}
        <div className="p-4 flex items-center gap-3 border-b border-border/50">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <StepIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{currentStepData.title}</h3>
            <p className="text-xs text-muted-foreground">{currentStepData.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 7 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-oracle text-white hover:opacity-90 transition-opacity"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-oracle-green text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Submit Verification
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
