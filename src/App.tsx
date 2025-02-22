import React, { useState } from 'react';
import { Upload, AlertCircle, Camera, ImageIcon } from 'lucide-react';
import axios from 'axios';

interface AnalysisResult {
  damage_score: number;
  intensity_level: string;
  metrics: {
    mse: number;
    ssim: number;
    histogram_correlation: number;
  };
}

interface ApiResponse {
  analysis: AnalysisResult;
  visualization: string;
}

function App() {
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'before') {
        setBeforeImage(file);
      } else {
        setAfterImage(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beforeImage || !afterImage) {
      setError('Please select both before and after images');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulated API response since we can't run the Python backend
    setTimeout(() => {
      const mockResult: ApiResponse = {
        analysis: {
          damage_score: 0.75,
          intensity_level: "Severe damage",
          metrics: {
            mse: 2345.67,
            ssim: 0.45,
            histogram_correlation: 0.62
          }
        },
        visualization: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=800"
      };
      
      setResult(mockResult);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Camera className="mx-auto h-12 w-12 text-indigo-600" />
          <h1 className="mt-4 text-4xl font-bold text-gray-900">Disaster Impact Analyzer</h1>
          <p className="mt-2 text-lg text-gray-600">Upload before and after images to analyze disaster impact</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Before Image Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Before Image</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {beforeImage ? (
                    <div className="space-y-2">
                      <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">{beforeImage.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'before')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* After Image Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">After Image</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {afterImage ? (
                    <div className="space-y-2">
                      <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">{afterImage.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'after')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="ml-3 text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !beforeImage || !afterImage}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                loading || !beforeImage || !afterImage
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Analyzing...' : 'Analyze Images'}
            </button>
          </form>

          {result && (
            <div className="mt-8 space-y-6">
              <div className="border-t pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Results</h2>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Damage Assessment</h3>
                      <div className="space-y-3">
                        <p className="text-gray-700">
                          <span className="font-medium">Damage Score:</span>{' '}
                          {(result.analysis.damage_score * 100).toFixed(1)}%
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Intensity Level:</span>{' '}
                          {result.analysis.intensity_level}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Technical Metrics</h3>
                      <div className="space-y-3">
                        <p className="text-gray-700">
                          <span className="font-medium">MSE:</span>{' '}
                          {result.analysis.metrics.mse.toFixed(2)}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">SSIM:</span>{' '}
                          {result.analysis.metrics.ssim.toFixed(2)}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Histogram Correlation:</span>{' '}
                          {result.analysis.metrics.histogram_correlation.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Visual Comparison</h3>
                  <img
                    src={result.visualization}
                    alt="Damage analysis visualization"
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;