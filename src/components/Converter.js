import { useState, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import ProgressBar from './ProgressBar';

const Converter = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [downloadLink, setDownloadLink] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 100 * 1024 * 1024) {
      setError(t('max_size'));
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const handleConvert = async () => {
    if (!file) {
      setError(t('error.no_file'));
      return;
    }

    setIsConverting(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('File', file);

      const response = await axios.post(
        `https://v2.convertapi.com/convert/mp4/to/mp3?Secret=${process.env.NEXT_PUBLIC_CONVERTAPI_KEY}`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      setDownloadLink(response.data.Files[0].Url);
      setError('');
    } catch (err) {
      setError(t('error.conversion'));
      console.error(err);
    } finally {
      setIsConverting(false);
    }
  };

  const resetConverter = () => {
    setFile(null);
    setDownloadLink('');
    setProgress(0);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-center">
        {t('title')}
      </h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('select_file')}
        </label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".mp4,.MP4,.m4v,.M4V"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {file && (
        <div className="mb-4 text-sm">
          <p>{t('selected_file')} {file.name}</p>
          <p>{t('file_size')} {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
        </div>
      )}

      {isConverting && <ProgressBar progress={progress} />}

      <div className="flex space-x-3">
        <button
          onClick={handleConvert}
          disabled={isConverting || !file}
          className={`px-4 py-2 rounded-md text-white text-sm font-medium ${isConverting || !file ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isConverting ? t('converting') : t('convert')}
        </button>

        {(downloadLink || file) && (
          <button
            onClick={resetConverter}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-300"
          >
            {t('reset')}
          </button>
        )}
      </div>

      {downloadLink && (
        <div className="mt-4">
          <a
            href={downloadLink}
            download="converted.mp3"
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 block text-center"
          >
            {t('download')}
          </a>
          <p className="mt-2 text-xs text-gray-500">
            {t('file_expiry_notice')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Converter;
