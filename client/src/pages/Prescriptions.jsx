import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, FileText } from 'lucide-react';
import AppShell from '../components/AppShell';
import api, { getErrorMessage } from '../lib/api';

export default function Prescriptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [ocrRunning, setOcrRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    api
      .get('/prescriptions')
      .then((res) => setItems(res.data.prescriptions))
      .catch(() => setError('Could not load your saved prescriptions.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setOcrText('');

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setPreview(dataUrl);
      setOcrRunning(true);
      try {
        const { default: Tesseract } = await import('tesseract.js');
        const result = await Tesseract.recognize(file, 'eng');
        setOcrText(result.data.text.trim());
      } catch (err) {
        console.error(err);
        setOcrText('');
        setError('Could not read text from this image, but you can still save it.');
      } finally {
        setOcrRunning(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!preview) return;
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/prescriptions', {
        imageData: preview,
        extractedText: ocrText
      });
      setItems((prev) => [res.data.prescription, ...prev]);
      setPreview(null);
      setOcrText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/prescriptions/${id}`);
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-8">
        <h1 className="font-display text-2xl font-semibold mb-1">Prescription Analyzer</h1>
        <p className="text-sm text-slate mb-6">
          Upload a photo of a prescription. Text is extracted right in your browser and saved to your account.
        </p>

        {error && <div className="bg-coral-100 text-coral-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

        <div className="card p-6 mb-8">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-line rounded-xl py-10 cursor-pointer hover:border-teal-500 transition-colors">
            <Upload className="text-teal-600 mb-2" size={24} />
            <span className="text-sm font-medium">Click to upload a prescription image</span>
            <span className="text-xs text-slate mt-1">JPG or PNG</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {preview && (
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <img src={preview} alt="Uploaded prescription preview" className="rounded-lg border border-line w-full object-cover max-h-64" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate mb-2">Extracted text</p>
                {ocrRunning ? (
                  <p className="text-sm text-slate italic">Reading image…</p>
                ) : (
                  <p className="text-sm text-ink-soft whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {ocrText || 'No readable text found — you can still save the image.'}
                  </p>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving || ocrRunning}
                  className="mt-4 bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Saving…' : 'Save prescription'}
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-light mt-4">
            OCR results may be imperfect. Always verify medication details with your doctor or pharmacist.
          </p>
        </div>

        <h2 className="font-semibold text-lg mb-3">Saved prescriptions</h2>
        {loading && <p className="text-sm text-slate">Loading…</p>}
        {!loading && items.length === 0 && (
          <div className="card p-8 text-center">
            <FileText className="mx-auto text-slate-light mb-2" size={28} />
            <p className="text-sm text-slate">No prescriptions saved yet.</p>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex gap-3">
              <img src={item.image_data} alt="Saved prescription" className="w-20 h-20 object-cover rounded-lg border border-line shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-light mb-1">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-ink-soft line-clamp-3">
                  {item.extracted_text || 'No text extracted'}
                </p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-slate-light hover:text-coral-600 self-start"
                aria-label="Delete prescription"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
