import React, { useState } from 'react';
import { GraduationCap, Check, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StudentVerificationProps {
  onSubmit: (data: {
    waecNumber: string;
    institution: string;
    country: string;
  }) => Promise<void>;
  status: 'none' | 'pending' | 'approved' | 'rejected';
}

const WEST_AFRICAN_COUNTRIES = [
  'Nigeria',
  'Ghana',
  'Senegal',
  'Côte d\'Ivoire',
  'Mali',
  'Burkina Faso',
  'Niger',
  'Guinea',
  'Benin',
  'Togo',
  'Sierra Leone',
  'Liberia',
  'Mauritania',
  'Gambia',
  'Guinea-Bissau',
  'Cape Verde',
];

export const StudentVerification: React.FC<StudentVerificationProps> = ({ onSubmit, status }) => {
  const [waecNumber, setWaecNumber] = useState('');
  const [institution, setInstitution] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waecNumber || !institution || !country) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ waecNumber, institution, country });
      toast.success('Verification submitted! We\'ll review your application.');
    } catch (error) {
      toast.error('Failed to submit verification');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'approved') {
    return (
      <div className="glass-card p-4 border-oracle-green/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-oracle-green/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-oracle-green" />
          </div>
          <div>
            <h3 className="font-medium text-oracle-green">Student Verified</h3>
            <p className="text-xs text-muted-foreground">
              You have free access to Preview & Experimental models
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="glass-card p-4 border-oracle-gold/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-oracle-gold/20 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-oracle-gold animate-spin" />
          </div>
          <div>
            <h3 className="font-medium text-oracle-gold">Verification Pending</h3>
            <p className="text-xs text-muted-foreground">
              We're reviewing your student status. This may take 24-48 hours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="glass-card p-4 border-oracle-red/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-oracle-red/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-oracle-red" />
          </div>
          <div>
            <h3 className="font-medium text-oracle-red">Verification Failed</h3>
            <p className="text-xs text-muted-foreground">
              We couldn't verify your student status. Please try again with correct details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-oracle-purple/20 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-oracle-purple" />
        </div>
        <div>
          <h3 className="font-medium">Student Verification</h3>
          <p className="text-xs text-muted-foreground">
            West Africa students get free access to Preview & Exp models
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-muted border-none rounded-lg px-3 py-2.5 text-sm"
            required
          >
            <option value="">Select your country</option>
            {WEST_AFRICAN_COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground block mb-1">Institution</label>
          <input
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Your school or university name"
            className="w-full bg-muted border-none rounded-lg px-3 py-2.5 text-sm"
            required
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground block mb-1">WAEC Number</label>
          <input
            type="text"
            value={waecNumber}
            onChange={(e) => setWaecNumber(e.target.value)}
            placeholder="Your WAEC examination number"
            className="w-full bg-muted border-none rounded-lg px-3 py-2.5 text-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-gradient-oracle text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <GraduationCap className="w-4 h-4" />
              Submit Verification
            </>
          )}
        </button>
      </form>

      <p className="text-[10px] text-muted-foreground text-center mt-3">
        Note: 10% profit share applies to student accounts
      </p>
    </div>
  );
};
