import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import ComponentErrorBoundary from '../../components/error/ComponentErrorBoundary';
import {
  MobileCard,
  MobileCardHeader,
  MobileCardTitle,
  MobileCardContent,
  MobileButton,
  Form,
  FormGroup,
  Label,
  Input,
  TextArea
} from '../../components/ui';
import { usePost, useGet } from '../../hooks/useSimpleApi';
import { ArrowLeft, Save, Package, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

const artifactSchema = z.object({
  name: z.object({
    en: z.string().min(1, 'English name is required'),
    rw: z.string().optional(),
    fr: z.string().optional()
  }),
  description: z.object({
    en: z.string().min(10, 'English description must be at least 10 characters'),
    rw: z.string().optional(),
    fr: z.string().optional()
  }),
  category: z.string().min(1, 'Category is required'),
  heritageSiteId: z.number().min(1, 'Heritage site is required'),
  isPublic: z.boolean().default(true)
});

const ArtifactCreation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch heritage sites based on user role
  const { data: heritageSites, loading: sitesLoading, error: sitesError } = useGet('/api/heritage-sites/for-artifacts', {}, {});

  const createArtifact = usePost('/api/artifacts', {
    onSuccess: (data) => {
      console.log('Artifact created successfully:', data);
      // Success toast is now handled in onSubmit
      navigate(`/dashboard/artifacts/${data.id}`);
    },
    onError: (error) => {
      console.error('Failed to create artifact:', error);
      toast.error('Failed to create artifact. Please try again.', {
        duration: 5000,
        icon: '❌',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    }
  });

  const form = useForm({
    resolver: zodResolver(artifactSchema),
    defaultValues: {
      name: { en: '', rw: '', fr: '' },
      description: { en: '', rw: '', fr: '' },
      category: '',
      heritageSiteId: undefined,
      isPublic: true
    }
  });

  const categories = ['Ceramics', 'Textiles', 'Metalwork', 'Woodwork', 'Stonework', 'Musical Instruments', 'Jewelry', 'Tools', 'Weapons', 'Religious Objects', 'Royal Regalia', 'Agricultural Tools', 'Domestic Items', 'Other'];

  const onSubmit = async (data) => {
    try {
      console.log('Form submitted with data:', data);
      console.log('Form validation state:', form.formState);
      setIsSubmitting(true);

      // Show loading toast
      const loadingToast = toast.loading('Creating artifact...', {
        duration: Infinity,
        style: {
          background: '#3B82F6',
          color: '#fff',
        },
      });

      console.log('Calling createArtifact.execute...');
      await createArtifact.execute(data);
      console.log('createArtifact.execute completed');

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show success toast
      toast.success('Artifact created successfully!', {
        duration: 4000,
        icon: '🎉',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });

    } catch (error) {
      console.error('Error creating artifact:', error);
      // Error toast is handled in the usePost hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ComponentErrorBoundary componentName="Artifact Creation">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Artifact</h1>
            <p className="text-gray-600 dark:text-gray-400">Add a new cultural artifact to the system</p>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">Your Role:</span> {user?.role === 'SYSTEM_ADMINISTRATOR' ? 'System Administrator' :
                user?.role === 'HERITAGE_MANAGER' ? 'Heritage Manager' : 'User'}
              {user?.role === 'HERITAGE_MANAGER' && (
                <span className="ml-4">
                  • <span className="font-medium">Note:</span> You can only create artifacts for your assigned heritage sites
                </span>
              )}
            </div>
          </div>
          <MobileButton
            variant="outline"
            onClick={() => navigate('/dashboard/artifacts')}
            icon={ArrowLeft}
            className="w-full sm:w-auto"
          >
            Back to Artifacts
          </MobileButton>
        </div>

        {/* Form */}
        <Form onSubmit={form.handleSubmit(onSubmit)}>
          <MobileCard>
            <MobileCardHeader>
              <MobileCardTitle icon={Package}>Basic Information</MobileCardTitle>
            </MobileCardHeader>
            <MobileCardContent className="space-y-6">
              {/* Name Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Name*</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormGroup>
                    <Label htmlFor="name.en">English*</Label>
                    <Input
                      id="name.en"
                      placeholder="Enter artifact name in English"
                      value={form.watch('name.en') || ''}
                      onChange={(e) => form.setValue('name.en', e.target.value)}
                      error={form.formState.errors.name?.en?.message}
                    />
                    {form.formState.errors.name?.en && (
                      <span className="text-red-500 text-sm mt-1">{form.formState.errors.name.en.message}</span>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="name.rw">Kinyarwanda</Label>
                    <Input
                      id="name.rw"
                      placeholder="Enter artifact name in Kinyarwanda"
                      value={form.watch('name.rw') || ''}
                      onChange={(e) => form.setValue('name.rw', e.target.value)}
                      error={form.formState.errors.name?.rw?.message}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="name.fr">French</Label>
                    <Input
                      id="name.fr"
                      placeholder="Enter artifact name in French"
                      value={form.watch('name.fr') || ''}
                      onChange={(e) => form.setValue('name.fr', e.target.value)}
                      error={form.formState.errors.name?.fr?.message}
                    />
                  </FormGroup>
                </div>
              </div>

              {/* Description Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description*</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormGroup>
                    <Label htmlFor="description.en">English*</Label>
                    <TextArea
                      id="description.en"
                      placeholder="Describe the artifact in English (minimum 10 characters)"
                      rows={4}
                      value={form.watch('description.en') || ''}
                      onChange={(e) => form.setValue('description.en', e.target.value)}
                      error={form.formState.errors.description?.en?.message}
                    />
                    {form.formState.errors.description?.en && (
                      <span className="text-red-500 text-sm mt-1">{form.formState.errors.description.en.message}</span>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Characters: {form.watch('description.en')?.length || 0} / 10 minimum
                    </p>
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="description.rw">Kinyarwanda</Label>
                    <TextArea
                      id="description.rw"
                      placeholder="Describe the artifact in Kinyarwanda"
                      rows={4}
                      value={form.watch('description.rw') || ''}
                      onChange={(e) => form.setValue('description.rw', e.target.value)}
                      error={form.formState.errors.description?.rw?.message}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="description.fr">French</Label>
                    <TextArea
                      id="description.fr"
                      placeholder="Describe the artifact in French"
                      rows={4}
                      value={form.watch('description.fr') || ''}
                      onChange={(e) => form.setValue('description.fr', e.target.value)}
                      error={form.formState.errors.description?.fr?.message}
                    />
                  </FormGroup>
                </div>
              </div>

              {/* Category and Heritage Site */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormGroup>
                  <Label htmlFor="category">Category*</Label>
                  <select
                    id="category"
                    {...form.register('category')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.category && (
                    <span className="text-red-500 text-sm mt-1">{form.formState.errors.category.message}</span>
                  )}
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="heritageSiteId">Heritage Site*</Label>
                  {sitesLoading ? (
                    <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500">
                      Loading heritage sites...
                    </div>
                  ) : sitesError ? (
                    <div className="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600">
                      Error loading heritage sites
                    </div>
                  ) : !heritageSites || heritageSites.length === 0 ? (
                    <div className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-md bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">
                      No heritage sites available
                    </div>
                  ) : (
                    <select
                      id="heritageSiteId"
                      {...form.register('heritageSiteId', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select heritage site</option>
                      {heritageSites?.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name} - {site.region}
                        </option>
                      ))}
                    </select>
                  )}
                  {form.formState.errors.heritageSiteId && (
                    <span className="text-red-500 text-sm mt-1">{form.formState.errors.heritageSiteId.message}</span>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {user?.role === 'HERITAGE_MANAGER'
                      ? 'You can only see heritage sites you are assigned to manage.'
                      : user?.role === 'SYSTEM_ADMINISTRATOR'
                        ? 'You can see all heritage sites in the system.'
                        : 'You can see public heritage sites.'
                    }
                  </p>
                  {(!heritageSites || heritageSites.length === 0) && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                      {user?.role === 'HERITAGE_MANAGER'
                        ? 'No heritage sites are currently assigned to you. Please contact an administrator.'
                        : 'No heritage sites are currently available. Please contact an administrator.'
                      }
                    </p>
                  )}
                </FormGroup>
              </div>

              {/* Visibility Setting */}
              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="isPublic"
                  {...form.register('isPublic')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <Label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Make this artifact publicly visible
                </Label>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Public artifacts are visible to all users, private ones require authentication
              </p>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 space-x-3">
                <MobileButton
                  type="submit"
                  disabled={isSubmitting || sitesLoading}
                  icon={Save}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? 'Creating Artifact...' : 'Create Artifact'}
                </MobileButton>
              </div>
            </MobileCardContent>
          </MobileCard>
        </Form>
      </div>
    </ComponentErrorBoundary>
  );
};

export default ArtifactCreation;

