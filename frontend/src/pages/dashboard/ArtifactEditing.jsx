import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  FormGroup,
  Label,
  Input,
  TextArea
} from '../../components/ui';
import { useGet, usePut } from '../../hooks/useSimpleApi';
import { ArrowLeft, Save, Package, AlertCircle, MapPin } from 'lucide-react';
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

const ArtifactEditing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch heritage sites based on user role
  const { data: heritageSites, loading: sitesLoading, error: sitesError } = useGet('/api/heritage-sites/for-artifacts', {}, {});

  const { data: artifact, loading: loadingArtifact, error: artifactError } = useGet(`/api/artifacts/${parseInt(id)}`, {}, {});
  const updateArtifact = usePut(`/api/artifacts/${parseInt(id)}`, {
    onSuccess: (data) => {
      console.log('Artifact updated successfully:', data);
      toast.success('Artifact updated successfully! 🎉');
      navigate(`/dashboard/artifacts/${id}`);
    },
    onError: (error) => {
      console.error('Failed to update artifact:', error);
      toast.error('Failed to update artifact. Please try again.');
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

  useEffect(() => {
    if (artifact) {
      form.reset({
        name: {
          en: artifact.name?.en || '',
          rw: artifact.name?.rw || '',
          fr: artifact.name?.fr || ''
        },
        description: {
          en: artifact.description?.en || '',
          rw: artifact.description?.rw || '',
          fr: artifact.description?.fr || ''
        },
        category: artifact.category || '',
        heritageSiteId: artifact.heritageSite?.id || undefined,
        isPublic: artifact.isPublic ?? true
      });
    }
  }, [artifact, form]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name) {
        // Compare current form values with original artifact values
        const currentValues = form.getValues();
        const hasActualChanges =
          currentValues.name?.en !== (artifact?.name?.en || '') ||
          currentValues.name?.rw !== (artifact?.name?.rw || '') ||
          currentValues.name?.fr !== (artifact?.name?.fr || '') ||
          currentValues.description?.en !== (artifact?.description?.en || '') ||
          currentValues.description?.rw !== (artifact?.description?.rw || '') ||
          currentValues.description?.fr !== (artifact?.description?.fr || '') ||
          currentValues.category !== (artifact?.category || '') ||
          currentValues.heritageSiteId !== (artifact?.heritageSite?.id || undefined) ||
          currentValues.isPublic !== (artifact?.isPublic ?? true);

        setHasChanges(hasActualChanges);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, artifact]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Show loading toast
      const loadingToast = toast.loading('Updating artifact...', {
        duration: Infinity,
        style: {
          background: '#3B82F6',
          color: '#fff',
        },
      });

      await updateArtifact.execute(data);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

    } catch (error) {
      console.error('Error updating artifact:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingArtifact) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (artifactError) {
    return (
      <MobileCard>
        <MobileCardContent>
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>Failed to load artifact. Please try again.</span>
          </div>
        </MobileCardContent>
      </MobileCard>
    );
  }

  if (!artifact) {
    return (
      <MobileCard>
        <MobileCardContent>
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Artifact not found.</p>
          </div>
        </MobileCardContent>
      </MobileCard>
    );
  }

  return (
    <ComponentErrorBoundary componentName="Artifact Editing">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Artifact</h1>
            <p className="text-gray-600 dark:text-gray-400">Update artifact information</p>
            {hasChanges && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                Unsaved changes
              </div>
            )}
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">Your Role:</span> {user?.role === 'SYSTEM_ADMINISTRATOR' ? 'System Administrator' :
                user?.role === 'HERITAGE_MANAGER' ? 'Heritage Manager' : 'User'}
              {artifact?.heritageSite && (
                <span className="ml-4">
                  • <span className="font-medium">Site:</span> {artifact.heritageSite.nameEn || artifact.heritageSite.nameRw || artifact.heritageSite.nameFr}
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <MobileButton
              variant="outline"
              onClick={() => navigate(`/dashboard/artifacts/${id}`)}
              icon={ArrowLeft}
              size="sm"
            >
              Back to Details
            </MobileButton>
            <MobileButton
              type="submit"
              form="artifact-form"
              disabled={!hasChanges || isSubmitting}
              icon={Save}
              size="sm"
              className={`transition-all duration-200 ${isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : hasChanges
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <span>Save Changes</span>
              )}
            </MobileButton>
          </div>
        </div>

        {/* Form */}
        <form id="artifact-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <MobileCard>
            <MobileCardHeader>
              <MobileCardTitle icon={Package}>Basic Information</MobileCardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Update the artifact details below. Required fields are marked with an asterisk (*).
              </p>
            </MobileCardHeader>
            <MobileCardContent className="space-y-8">
              {/* Name Fields */}
              <div className="space-y-4">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Name*
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Provide the artifact name in multiple languages for accessibility
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormGroup>
                    <Label htmlFor="name.en" className="flex items-center">
                      <span className="text-red-500 mr-1">*</span>
                      English
                    </Label>
                    <Input
                      id="name.en"
                      placeholder="Enter artifact name in English"
                      value={form.watch('name.en') || ''}
                      onChange={(e) => form.setValue('name.en', e.target.value)}
                      error={form.formState.errors.name?.en?.message}
                      className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="name.rw">Kinyarwanda</Label>
                    <Input
                      id="name.rw"
                      placeholder="Enter artifact name in Kinyarwanda"
                      value={form.watch('name.rw') || ''}
                      onChange={(e) => form.setValue('name.rw', e.target.value)}
                      error={form.formState.errors.name?.rw?.message}
                      className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormGroup>
                </div>
              </div>

              {/* Description Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description*</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormGroup>
                    <Label htmlFor="description.en">English</Label>
                    <TextArea
                      id="description.en"
                      placeholder="Describe the artifact in English"
                      rows={4}
                      value={form.watch('description.en') || ''}
                      onChange={(e) => form.setValue('description.en', e.target.value)}
                      error={form.formState.errors.description?.en?.message}
                    />
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
              <div className="space-y-4">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Classification & Location
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Set the artifact category and assign it to a heritage site
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          : 'Other roles can see public heritage sites.'
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
              </div>

              {/* Visibility Setting */}
              <div className="space-y-4">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    Visibility Settings
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Control who can view this artifact
                  </p>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <input
                    type="checkbox"
                    id="isPublic"
                    {...form.register('isPublic')}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-2"
                  />
                  <Label htmlFor="isPublic" className="text-base font-medium">
                    Make this artifact publicly visible
                  </Label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {form.watch('isPublic')
                    ? 'This artifact will be visible to all users and visitors.'
                    : 'This artifact will only be visible to authorized users.'
                  }
                </p>
              </div>
            </MobileCardContent>
          </MobileCard>
        </form>
      </div>
    </ComponentErrorBoundary>
  );
};

export default ArtifactEditing;

