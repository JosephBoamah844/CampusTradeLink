import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { CreateUserSchema } from '@campus-trade-link/shared';
import { useAuthStore } from '@/store/auth';
import { toast } from 'react-hot-toast';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';

interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(CreateUserSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data.email, data.username, data.password, data.displayName);
      toast.success('Account created! Please check your email to verify your account.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - Campus Trade Link</title>
        <meta name="description" content="Join Campus Trade Link" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">CT</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Join Campus Trade Link
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect with fellow UG students
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <Input
                {...register('email')}
                type="email"
                label="Student Email"
                placeholder="your.email@st.ug.edu.gh"
                error={errors.email?.message}
                helperText="Must be a valid UG student email"
                autoComplete="email"
                autoFocus
              />

              <Input
                {...register('username')}
                type="text"
                label="Username"
                placeholder="Choose a unique username"
                error={errors.username?.message}
                helperText="3-30 characters, letters, numbers, and underscores only"
                autoComplete="username"
              />

              <Input
                {...register('displayName')}
                type="text"
                label="Display Name (Optional)"
                placeholder="Your full name"
                error={errors.displayName?.message}
                autoComplete="name"
              />

              <Input
                {...register('password')}
                type="password"
                label="Password"
                placeholder="Create a strong password"
                error={errors.password?.message}
                helperText="At least 8 characters with uppercase, lowercase, and number"
                autoComplete="new-password"
              />

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/login">
                  <Button variant="outline" fullWidth>
                    Sign in instead
                  </Button>
                </Link>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 Campus Trade Link. All rights reserved.</p>
          <p className="mt-1">
            Exclusive to University of Ghana students
          </p>
        </div>
      </div>
    </>
  );
}