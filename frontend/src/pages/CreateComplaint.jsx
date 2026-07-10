import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { Loader2, ArrowLeft, ImagePlus, AlertCircle, AlertTriangle } from 'lucide-react';
import MapSelector from '../components/MapSelector';


const CreateComplaint = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [lat, setLat] = useState(25.4358);
  const [lng, setLng] = useState(81.8463);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: '',
      location: {
        ward: 'Ward 1: Civil Lines', // default ward matching seeder
        area: '',
        address: '',
      }
    }
  });

  const [nearbyDuplicates, setNearbyDuplicates] = useState([]);
  const categoryValue = watch('category');

  const checkNearbyDuplicates = async (selectedCategory, selectedLat, selectedLng) => {
    if (!selectedCategory || !selectedLat || !selectedLng) return;
    try {
      const res = await api.get(`/complaints/nearby?latitude=${selectedLat}&longitude=${selectedLng}&category=${encodeURIComponent(selectedCategory)}`);
      if (res.success && res.complaints?.length > 0) {
        setNearbyDuplicates(res.complaints);
      } else {
        setNearbyDuplicates([]);
      }
    } catch (err) {
      console.error('Error checking nearby complaints:', err);
    }
  };

  useEffect(() => {
    checkNearbyDuplicates(categoryValue, lat, lng);
  }, [categoryValue, lat, lng]);

  const handleUpvoteAndSubscribe = async (complaintId, fmcId) => {
    try {
      await api.post(`/complaints/${complaintId}/upvote`);
      alert(`Successfully upvoted and subscribed to Complaint ${fmcId}! You will receive progress notifications.`);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Failed to upvote complaint.');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  const onInvalid = (formErrors) => {
    alert('Please fill out all mandatory fields (Title, Category, Description, Ward, Area, Address) before submitting.');
  };

  const onSubmit = async (data) => {
    if (!lat || !lng) {
      alert('Please pinpoint a valid location inside Prayagraj city limits on the interactive map.');
      setError('Please select a valid location inside Prayagraj city limits.');
      return;
    }
    if (selectedFiles.length === 0) {
      alert('Please upload at least one photo as photographic evidence.');
      setError('Photographic evidence is required.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('location[address]', data.location.address);
      formData.append('location[ward]', data.location.ward);
      formData.append('location[area]', data.location.area);
      formData.append('location[coordinates][latitude]', lat);
      formData.append('location[coordinates][longitude]', lng);

      // Append selected images
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      await api.post('/complaints', formData);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.message || 'Failed to submit complaint. Please verify your inputs.';
      alert(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[720px] mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/dashboard" className="p-2 hover:bg-slate-200 rounded-sm text-govtext-muted transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-govtext-dark">Submit New Complaint</h1>
          <p className="text-xs text-govtext-muted mt-0.5">Please provide accurate description and location details.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-danger-light text-danger border border-danger-light text-xs rounded-sm font-medium flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Proactive Duplicate Upvote Panel */}
      {nearbyDuplicates.length > 0 && (
        <div className="bg-yellow-50/50 border border-yellow-200 p-5 rounded-md space-y-3">
          <div className="flex items-center gap-2 text-[#b25e00] font-bold text-xs uppercase tracking-wider">
            <AlertTriangle size={15} />
            <span>Similar Active Complaints Found Nearby!</span>
          </div>
          <p className="text-xs text-govtext-muted leading-relaxed">
            Other citizens have already reported similar issues within 100 meters of your coordinates. To avoid duplicates and help the city prioritize, you can directly upvote one of them instead of submitting a new case file!
          </p>
          <div className="space-y-2.5">
            {nearbyDuplicates.map(({ complaint, distance }) => (
              <div key={complaint._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 border border-govborder rounded-sm shadow-sm gap-4">
                <div className="text-left space-y-1">
                  <div className="text-xs font-bold text-govtext-dark flex items-center gap-2">
                    <span className="font-mono text-primary bg-blue-50 px-1.5 py-0.5 rounded text-[10px] border border-blue-100">{complaint.complaintId}</span>
                    <span>{complaint.title}</span>
                  </div>
                  <p className="text-[10px] text-govtext-light">{complaint.location.address} ({distance} meters away)</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpvoteAndSubscribe(complaint._id, complaint.complaintId)}
                  className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-3 py-2 rounded transition-colors flex-shrink-0"
                >
                  Upvote & Subscribe
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="bg-white border border-govborder p-6 rounded-sm space-y-6 shadow-sm">
        {/* Core details */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-govtext-dark uppercase tracking-wider border-b border-govborder pb-2">
            1. Issue Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-govtext-dark mb-1.5 uppercase tracking-wider">
                Title / Heading <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="Briefly name the issue (e.g. Broken streetlight near Metro Gate)"
                {...register('title', { required: 'Title is required' })}
                className={`w-full p-2 border text-xs rounded-sm focus:outline-none focus:border-primary ${
                  errors.title ? 'border-danger' : 'border-govborder'
                }`}
              />
              {errors.title && (
                <span className="text-[10px] text-danger mt-1 block font-medium">{errors.title.message}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-govtext-dark mb-1.5 uppercase tracking-wider">
                Category <span className="text-danger">*</span>
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full p-2 border border-govborder text-xs rounded-sm bg-white focus:outline-none focus:border-primary"
              >
                <option value="">Select Category</option>
                <option value="Garbage Collection">Garbage Collection</option>
                <option value="Road Damage">Road Damage</option>
                <option value="Water Leakage">Water Leakage</option>
                <option value="Drainage">Drainage</option>
                <option value="Street Light">Street Light</option>
                <option value="Illegal Construction">Illegal Construction</option>
                <option value="Public Toilet">Public Toilet</option>
                <option value="Parks">Parks</option>
                <option value="Stray Animals">Stray Animals</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-govtext-dark mb-1.5 uppercase tracking-wider">
              Detailed Description <span className="text-danger">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Provide a detailed description of the complaint. Mention specific landmarks, duration of the issue, and severity."
              {...register('description', { required: 'Description is required' })}
              className={`w-full p-2 border text-xs rounded-sm focus:outline-none focus:border-primary ${
                errors.description ? 'border-danger' : 'border-govborder'
              }`}
            />
            {errors.description && (
              <span className="text-[10px] text-danger mt-1 block font-medium">{errors.description.message}</span>
            )}
          </div>
        </div>

        {/* Location information */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-govtext-dark uppercase tracking-wider border-b border-govborder pb-2">
            2. Incident Location
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-govtext-dark mb-1.5 uppercase tracking-wider">
                Ward Number <span className="text-danger">*</span>
              </label>
              <select
                {...register('location.ward', { required: 'Ward is required' })}
                className="w-full p-2 border border-govborder text-xs rounded-sm focus:outline-none focus:border-primary bg-white"
              >
                <option value="">Select Ward</option>
                <option value="Ward 1: Civil Lines">Ward 1: Civil Lines</option>
                <option value="Ward 2: Katra">Ward 2: Katra</option>
                <option value="Ward 3: Georgetown">Ward 3: Georgetown</option>
                <option value="Ward 4: Naini">Ward 4: Naini</option>
                <option value="Ward 5: Ashok Nagar">Ward 5: Ashok Nagar</option>
                <option value="Ward 6: Jhalwa">Ward 6: Jhalwa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-govtext-dark mb-1.5 uppercase tracking-wider">
                Area / Locality <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Downtown sector 4"
                {...register('location.area', { required: 'Area is required' })}
                className="w-full p-2 border border-govborder text-xs rounded-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-govtext-dark mb-1.5 uppercase tracking-wider">
              Exact Address & Landmarks <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Opposite Central Park Gate 2, near coffee house"
              {...register('location.address', { required: 'Exact address is required' })}
              className="w-full p-2 border border-govborder text-xs rounded-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-2">
            <MapSelector lat={lat} lng={lng} onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }} />
          </div>
        </div>

        {/* File attachment */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-govtext-dark uppercase tracking-wider border-b border-govborder pb-2">
            3. Photographic Evidence
          </h2>

          <div className="border-2 border-dashed border-govborder p-6 rounded-sm flex flex-col items-center justify-center hover:bg-slate-50/50 transition-colors">
            <ImagePlus size={36} className="text-govtext-light mb-2" />
            <span className="text-xs font-semibold text-govtext-dark">Select Complaint Photos <span className="text-danger">*</span></span>
            <span className="text-[10px] text-govtext-light mt-1">Upload up to 5 images (At least 1 photo required)</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="mt-4 text-xs block w-full text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-sm file:border file:border-govborder file:text-xs file:font-semibold file:bg-govbg hover:file:bg-slate-100"
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="bg-govbg p-3 border border-govborder rounded-sm space-y-1">
              <span className="text-[10px] text-govtext-light uppercase tracking-wider font-bold block">Selected Files ({selectedFiles.length})</span>
              <ul className="text-xs text-govtext-dark list-disc list-inside">
                {selectedFiles.map((file, i) => (
                  <li key={i}>{file.name} ({Math.round(file.size / 1024)} KB)</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-govborder flex justify-end gap-2">
          <Link
            to="/dashboard"
            className="border border-govborder hover:bg-govbg text-govtext-dark text-xs font-bold px-4 py-2 rounded-sm transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-2 rounded-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin" size={14} />}
            Submit Case File
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateComplaint;
