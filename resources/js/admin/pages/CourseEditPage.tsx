import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FormSection } from '../components/FormSection';
import TranslatableField from '../components/TranslatableField';
import TranslatableRichText from '../components/TranslatableRichText';
import { IMAGE_GUIDELINES } from '../components/ImageUploadWithCrop';
import { MultiImageGallery } from '../components/MultiImageGallery';
import { useGetCourseQuery, useGetCategoriesQuery, useCreateCourseMutation, useUpdateCourseMutation, useUploadCourseImagesMutation, useDeleteCourseImageMutation, useSetCourseMainImageMutation, useReorderCourseImagesMutation } from '../../services/api';
import toast from 'react-hot-toast';

interface FormData {
  name: string;
  subtitle: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  category_id: number | null;
  is_active: boolean;
  is_featured: boolean;
  max_students: number | null;
  name_translations: { ar: string };
  subtitle_translations: { ar: string };
  description_translations: { ar: string };
}

const initialFormData: FormData = {
  name: '',
  subtitle: '',
  description: '',
  price: 0,
  duration: '',
  level: '',
  category_id: null,
  is_active: true,
  is_featured: false,
  max_students: null,
  name_translations: { ar: '' },
  subtitle_translations: { ar: '' },
  description_translations: { ar: '' },
};

export const CourseEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { data: course, isLoading: isLoadingCourse, error: courseError } = useGetCourseQuery(Number(id), {
    skip: !isEditMode,
  });
  const { data: categories = [] } = useGetCategoriesQuery({ active: true, type: 'course' });
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [uploadCourseImages] = useUploadCourseImagesMutation();
  const [deleteCourseImage] = useDeleteCourseImageMutation();
  const [setCourseMainImage] = useSetCourseMainImageMutation();
  const [reorderCourseImages] = useReorderCourseImagesMutation();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isDirty, setIsDirty] = useState(false);
  const [initialData, setInitialData] = useState<FormData>(initialFormData);

  useEffect(() => {
    if (course && isEditMode) {
      const loadedData: FormData = {
        name: course.name,
        subtitle: course.subtitle || '',
        description: course.description || '',
        price: Number(course.price),
        duration: course.duration || '',
        level: course.level || '',
        category_id: course.category_id || null,
        is_active: course.is_active,
        is_featured: course.is_featured,
        max_students: course.max_students || null,
        name_translations: (course as any).name_translations || { ar: '' },
        subtitle_translations: (course as any).subtitle_translations || { ar: '' },
        description_translations: (course as any).description_translations || { ar: '' },
      };
      setFormData(loadedData);
      setInitialData(loadedData);
    }
  }, [course, isEditMode]);

  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);
    setIsDirty(hasChanges);
  }, [formData, initialData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleBack = useCallback(() => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/admin/courses');
      }
    } else {
      navigate('/admin/courses');
    }
  }, [isDirty, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('subtitle', formData.subtitle);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price.toString());
      if (formData.duration) {
        submitData.append('duration', formData.duration);
      }
      if (formData.level) {
        submitData.append('level', formData.level);
      }
      submitData.append('is_active', formData.is_active ? '1' : '0');
      submitData.append('is_featured', formData.is_featured ? '1' : '0');

      if (formData.category_id) {
        submitData.append('category_id', formData.category_id.toString());
      }
      if (formData.max_students) {
        submitData.append('max_students', formData.max_students.toString());
      }

      submitData.append('name_translations', JSON.stringify(formData.name_translations));
      submitData.append('subtitle_translations', JSON.stringify(formData.subtitle_translations));
      submitData.append('description_translations', JSON.stringify(formData.description_translations));

      if (isEditMode) {
        submitData.append('_method', 'PUT');
        await updateCourse({ id: Number(id), data: submitData }).unwrap();
        toast.success('Course updated successfully');
        navigate('/admin/courses');
      } else {
        const newCourse = await createCourse(submitData).unwrap();
        toast.success('Course created! You can now add images.');
        navigate(`/admin/courses/${newCourse.id}/edit`);
      }
    } catch (error: any) {
      console.error('Course save error:', error);
      if (error?.data?.errors) {
        Object.values(error.data.errors).flat().forEach((err: any) => toast.error(err));
      } else if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} course`);
      }
    }
  };

  const isLoading = isCreating || isUpdating;

  if (isEditMode && isLoadingCourse) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isEditMode && courseError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <h3 className="font-semibold mb-2">Course not found</h3>
        <button onClick={() => navigate('/admin/courses')} className="mt-4 text-red-700 underline">
          Return to Courses
        </button>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Courses', href: '/admin/courses' }, { label: isEditMode ? 'Edit Course' : 'New Course' }]} />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Course' : 'Add New Course'}</h1>
            {isEditMode && course && <p className="text-gray-500 text-sm mt-1">Editing: {course.name}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleBack} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg font-medium disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditMode ? 'Save Changes' : 'Create Course'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormSection title="Basic Information" description="Course name, description, and details">
            <div className="space-y-5">
              <TranslatableField label="Course Name" name="name" value={formData.name} translationValue={formData.name_translations.ar}
                onChangeEnglish={(value) => setFormData(prev => ({ ...prev, name: value }))}
                onChangeArabic={(value) => setFormData(prev => ({ ...prev, name_translations: { ar: value } }))}
                required placeholder="Enter course name" placeholderAr="أدخل اسم الدورة" />
              <TranslatableField label="Subtitle" name="subtitle" value={formData.subtitle} translationValue={formData.subtitle_translations.ar}
                onChangeEnglish={(value) => setFormData(prev => ({ ...prev, subtitle: value }))}
                onChangeArabic={(value) => setFormData(prev => ({ ...prev, subtitle_translations: { ar: value } }))}
                placeholder="Enter course subtitle" placeholderAr="أدخل العنوان الفرعي" />
              <TranslatableRichText label="Details" name="description" value={formData.description} translationValue={formData.description_translations.ar}
                onChangeEnglish={(value) => setFormData(prev => ({ ...prev, description: value }))}
                onChangeArabic={(value) => setFormData(prev => ({ ...prev, description_translations: { ar: value } }))}
                required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select value={formData.category_id || ''} onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value === '' ? null : Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="">No Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            </div>
          </FormSection>

          <FormSection title="Course Details" description="Price, duration, and level">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (SAR) *</label>
                <input type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  required step="0.01" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <input type="text" value={formData.duration} onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g. 4 weeks" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select value={formData.level} onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                  <option value="">No Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
                <input type="number" value={formData.max_students || ''} onChange={(e) => setFormData(prev => ({ ...prev, max_students: e.target.value === '' ? null : Number(e.target.value) }))}
                  min="1" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </FormSection>

          <FormSection title="Course Images" description={isEditMode ? "Manage course images and set main image" : "Save the course first to upload images"}>
            {isEditMode && course ? (
              <MultiImageGallery
                images={course.images || []}
                mainImagePath={course.image}
                guideline={IMAGE_GUIDELINES.course}
                disabled={isLoading}
                onUpload={async (files) => { await uploadCourseImages({ courseId: Number(id), files }).unwrap(); }}
                onDelete={async (imageId) => { await deleteCourseImage({ courseId: Number(id), imageId }).unwrap(); }}
                onSetMain={async (imageId) => { await setCourseMainImage({ courseId: Number(id), imageId }).unwrap(); }}
                onReorder={async (order) => { await reorderCourseImages({ courseId: Number(id), order }).unwrap(); }}
              />
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Save the course first, then you can upload and manage images.</p>
              </div>
            )}
          </FormSection>

          <FormSection title="Status & Visibility" description="Control course visibility">
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                <div><span className="text-sm font-medium text-gray-900 block">Active</span><span className="text-xs text-gray-500">Course is visible on the website</span></div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                <div><span className="text-sm font-medium text-gray-900 block">Featured</span><span className="text-xs text-gray-500">Show in featured courses section</span></div>
              </label>
            </div>
          </FormSection>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center gap-3 z-50">
          <button type="button" onClick={handleBack} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium">Cancel</button>
          <button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-medium disabled:opacity-50">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditMode ? 'Save' : 'Create'}
          </button>
        </div>
        <div className="lg:hidden h-24" />
      </form>
    </div>
  );
};
